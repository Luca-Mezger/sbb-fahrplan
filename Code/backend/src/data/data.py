import sqlite3 as sq
from datetime import datetime, timedelta

class Data():

    OLD_PATH = "../data/hrdf_2024-01-03.sqlite"
#    OLD_PATH = "../data/hrdf_2024-02-21.sqlite"
    NEW_PATH = "../data/hrdf_2024-02-21.sqlite"
    NEW_PATH = "../data/hrdf_2024-08-14.sqlite"

# The beginning of the new timetable. 
    SBB_DATE = datetime(2023, 12, 10)
    SEARCH_TIME_WINDOW = 29

    def __init__(self,):
        pass

    def get_bhfs(self,):
        """Return a list of all agencies with sublist: (id, name)
        """

        return self.__get_data_old("SELECT DISTINCT stops.stop_id, stops.stop_name from stops JOIN gleis_classification USING(stop_id) where gleis_classification.agency_id = 11;")

    def get_agency(self,):
        """Return a list of all agencies with sublist: (id, name, short_name)
        """

        return self.__get_data_old("SELECT agency_id, full_name_de, long_name from agency")

    def get_old_date(self):
        date = datetime.strptime(self.OLD_PATH, "../data/hrdf_%Y-%m-%d.sqlite")
        return date.strftime("%d.%m.%Y")

    def get_new_date(self):
        date = datetime.strptime(self.NEW_PATH, "../data/hrdf_%Y-%m-%d.sqlite")
        return date.strftime("%d.%m.%Y")

    def get_time_diffs_bhf(self, bhfs_id, date, agency_id=11):
        """Return a list of delayes
        """

        sbb_days = self.__date_to_sbb(date)

# SQL query to retrieve arrival times from old and new databases

        query = f"""
SELECT
group_concat(fplan_stop_times.fplan_trip_bitfeld_id) AS trip_bitfield_id,
group_concat(fplan_stop_times.stop_arrival) AS stop_arrs,
fplan.fplan_trip_id,
fplan.vehicle_type,
fplan.service_line,
gleis.track_full_text

FROM fplan, fplan_trip_bitfeld, calendar, fplan_stop_times
left join gleis using(gleis_id)
WHERE fplan.row_idx = fplan_trip_bitfeld.fplan_row_idx
AND fplan_trip_bitfeld.fplan_trip_bitfeld_id =
fplan_stop_times.fplan_trip_bitfeld_id
and fplan_stop_times.stop_id = "{bhfs_id}"
AND fplan_trip_bitfeld.service_id = calendar.service_id
AND SUBSTR(calendar.day_bits, {sbb_days}, 1) = "1" 
AND agency_id = "{agency_id}"
GROUP BY fplan_trip_bitfeld.fplan_trip_bitfeld_id
;
"""

        old_arr_times = self.__get_data_old(query)
        new_arr_times = self.__get_data_new(query)


        old_arr_dict = {el[2]: el for el in old_arr_times if el[1] != ""}
        new_arr_dict = {el[2]: el for el in new_arr_times if el[1] != ""}

        return_list = []

        new_trip_list = list(new_arr_dict.keys())

        for trip in new_trip_list:
            if not trip in old_arr_dict.keys():
                if len(trip) == 5 and trip[0] in ["1", "3"]:
                    new_arr_dict[trip[1:]] = new_arr_dict[trip]


        nearest_stops = self.__get_near_stops(bhfs_id)

        for trip in old_arr_dict.keys():
            if not trip in new_arr_dict.keys():
                #capture trips which are not there during construction
                #print(f"old trip: {old_arr_dict[trip]}")
                continue
            if old_arr_dict[trip][1]  != new_arr_dict[trip][1]:
                old_time = self.__24h_swap(old_arr_dict[trip][1])
                new_time = self.__24h_swap(new_arr_dict[trip][1])

                connection_miss = []


                for nearest_stop in nearest_stops:
                    old_stops = self.__get_connections(bhfs_id, nearest_stop[0], old_time, nearest_stop[1], OLD=True)
                    if old_stops == []:
                        continue
                    new_stops = self.__get_connections(bhfs_id, nearest_stop[0], new_time, nearest_stop[1], OLD=False)

                    old_stops_dict = {self.__fplan_shortening(stop[6]): stop for stop in old_stops}
                    new_stops_dict = {self.__fplan_shortening(stop[6]): stop for stop in new_stops}

                    for old_stop in old_stops_dict.keys():
                        if not old_stop in new_stops_dict.keys():
                            out_list = list(old_stops_dict[old_stop])

                            start_stop, end_stop = self.__fplan_first_last(out_list[6])

                            out_list.pop(-1)

                            time = self.__24h_swap(out_list[0])
                            out_list[0] = f"{time[:2]}:{time[2:]}"
                            out_list.append(nearest_stop[1])
                            out_list.append(start_stop)
                            out_list.append(end_stop)
                            connection_miss.append(out_list)


                element = (f"{old_time[:2]}:{old_time[2:]}",
                                    f"{new_time[:2]}:{new_time[2:]}",
                                    old_arr_dict[trip][3],
                                    old_arr_dict[trip][4],
                                    old_arr_dict[trip][2],
                                    old_arr_dict[trip][5],
                                    connection_miss)

                if connection_miss == []:
                    continue

                return_list.append(element)

        return return_list

    def __fplan_shortening(self, fplan_content):
        col_list = fplan_content.split("\n")

        string = ""
        for col in col_list:
            if col[0] != "*":
                string += col

        return string

    def __fplan_first_last(self, fplan_content):
        short = self.__fplan_shortening(fplan_content)

        short_list = short.split("\n")
        return short_list[0][8:29], short_list[-1][8:29]


    # Compare old and new arrival times and store the differences
    def __24h_swap(self, time_string):
        hours = int(time_string[:2])
        if hours > 23:
            time_string = f"0{hours-24}{time_string[2:]}"

        return time_string

    def __get_data_old(self, statment):
        db = sq.connect(self.OLD_PATH)
        cur = db.cursor()

        cur.execute(statment)
        return cur.fetchall()

    def __get_data_new(self, statment):
        db = sq.connect(self.NEW_PATH)
        cur = db.cursor()

        cur.execute(statment)
        return cur.fetchall()

    def __date_to_sbb(self, date):
        date = datetime.strptime(date, "%Y-%m-%d")

        return (date - self.SBB_DATE).days

    def __get_near_stops(self, bhfs_id):
        """returns walkable stops from bhfs in list with sublists (stop_id, walktime)
        """

        return self.__get_data_old(f"""select from_stop_id, walk_minutes from stop_relations where to_stop_id="{bhfs_id}"; """)

    def __get_connections(self, from_stop_id, to_stop_id, arr_time, walk_time, OLD=True):
        arr_time = datetime.strptime(arr_time, "%H%M")
        earliest_dep = arr_time + timedelta(minutes=walk_time)
        last_dep = arr_time + timedelta(minutes=walk_time) + timedelta(minutes=self.SEARCH_TIME_WINDOW)

        earliest_dep_string = earliest_dep.strftime("%H%M")
        last_dep_string = last_dep.strftime("%H%M")

        sql_time_search = f"(stop_departure glob '{earliest_dep_string[:3]}[{earliest_dep_string[3]}-9]'"
        sql_time_search += f"or stop_departure glob '{last_dep_string[:3]}[0-{last_dep_string[3]}]'"

        if earliest_dep_string[2] == last_dep_string[2]:
            hours = earliest_dep_string[:2]
            earliest_mins = earliest_dep_string[2]
            last_mins = last_dep_string[2]
            sql_time_search += f"or stop_departure glob '{hours}[{earliest_mins}-{last_mins}][0-9]]]'"
        else:
            hours_fix = earliest_dep_string[0]
            hours_low = earliest_dep_string[1]
            hours_high = last_dep_string[1]
            earliest_mins = int(earliest_dep_string[2])
            last_mins = int(last_dep_string[2])
            sql_time_search += f"or stop_departure glob '{hours_fix}{hours_low}[{earliest_mins+1}-5][0-9]]]'"
            sql_time_search += f"or stop_departure glob '{hours_fix}{hours_high}[0-{last_mins-1}][0-9]]]'"

        sql_time_search += ")"

        query = f"""select fplan_stop_times.stop_departure, fplan.vehicle_type, fplan.service_line,
gleis.track_full_text, fplan.agency_id,  fplan.fplan_trip_id, fplan.fplan_content

from fplan_stop_times join fplan_trip_bitfeld USING(fplan_trip_bitfeld_id)
join fplan on fplan.row_idx = fplan_trip_bitfeld.fplan_row_idx
left join service_line USING(service_line_id)
left join gleis using(gleis_id)

where stop_departure != "" AND {sql_time_search} AND fplan_stop_times.stop_id = {to_stop_id}"""


        if OLD:
            return self.__get_data_old(query)
        else:
            return self.__get_data_new(query)



if __name__ == "__main__":
    data = Data()

#    print(data.get_time_diffs_bhf("8507000", "2024-09-14")) #Fall 1
    data.get_time_diffs_bhf("8507483", "2024-04-28") #Fall 2
