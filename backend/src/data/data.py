import sqlite3 as sq
from datetime import datetime

class Data():

    OLD_PATH = "../data/hrdf_2024-01-03.sqlite"
#    OLD_PATH = "../data/hrdf_2024-02-21.sqlite"
    NEW_PATH = "../data/hrdf_2024-02-21.sqlite"
#    NEW_PATH = "../data/hrdf_2024-08-14.sqlite"

    SBB_DATE = datetime(2023, 12, 10)

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

    def get_time_diffs_bhf(self, bhfs_id, date):
        """Return a list of delayes
        """

        sbb_days = self.__date_to_sbb(date)

        querry = f"""
SELECT
group_concat(fplan_stop_times.fplan_trip_bitfeld_id) AS trip_bitfield_id,
group_concat(fplan_stop_times.stop_arrival) AS stop_arrs,
fplan.fplan_trip_id,
fplan.vehicle_type,
fplan.service_line

FROM fplan, fplan_trip_bitfeld, calendar, fplan_stop_times WHERE
fplan.row_idx = fplan_trip_bitfeld.fplan_row_idx
AND fplan_trip_bitfeld.fplan_trip_bitfeld_id =
fplan_stop_times.fplan_trip_bitfeld_id
and fplan_stop_times.stop_id = "{bhfs_id}"
AND fplan_trip_bitfeld.service_id = calendar.service_id
AND SUBSTR(calendar.day_bits, {sbb_days}, 1) = "1" 
GROUP BY fplan_trip_bitfeld.fplan_trip_bitfeld_id
;
"""

        old_arr_times = self.__get_data_old(querry)
        new_arr_times = self.__get_data_new(querry)


        old_arr_dict = {el[2]: el for el in old_arr_times if el[1] != ""}
        new_arr_dict = {el[2]: el for el in new_arr_times if el[1] != ""}

        return_list = []

        new_trip_list = list(new_arr_dict.keys())

        for trip in new_trip_list:
            if not trip in old_arr_dict.keys():
                if len(trip) == 5 and trip[0] in ["1", "3"]:
                    new_arr_dict[trip[1:]] = new_arr_dict[trip]


        for trip in old_arr_dict.keys():
            if not trip in new_arr_dict.keys():
                #capture trips which are not there during construction
                print(f"old trip: {old_arr_dict[trip]}")
                continue
            if old_arr_dict[trip][1]  != new_arr_dict[trip][1]:
                old_time = old_arr_dict[trip][1]
                new_time = new_arr_dict[trip][1]

                return_list.append((f"{old_time[:2]}:{old_time[2:]}",
                                    f"{new_time[:2]}:{new_time[2:]}",
                                    old_arr_dict[trip][3],
                                    old_arr_dict[trip][4]))

        return return_list


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

        return self.get_data_old(f"""select from_stop_id, walk_minutes from stop_relations where to_stop_id="{bhfs_id}"; """)

    def __get_connctions(self, stop_id, earliest_time):
        pass


if __name__ == "__main__":
    data = Data()

    print(data.get_time_diffs_bhf("8507100", "2024-03-24"))
