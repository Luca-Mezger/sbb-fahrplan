import sqlite3 as sq

class Data():

    OLD_PATH = "../data/hrdf_2024-01-03.sqlite"
    NEW_PATH = "../data/hrdf_2024-02-21.sqlite"

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

    def get_time_diffs_bhf(self, bhfs_id):
        """Return a list of delayes
        """

        querry = f"""
SELECT
group_concat(fplan_stop_times.fplan_trip_bitfeld_id) AS trip_bitfield_id,
group_concat(fplan_stop_times.stop_arrival) AS stop_arrs

FROM fplan, fplan_trip_bitfeld, calendar, fplan_stop_times WHERE
fplan.row_idx = fplan_trip_bitfeld.fplan_row_idx
AND fplan_trip_bitfeld.fplan_trip_bitfeld_id =
fplan_stop_times.fplan_trip_bitfeld_id
and fplan_stop_times.stop_id = "{bhfs_id}"
AND fplan_trip_bitfeld.service_id = calendar.service_id
AND SUBSTR(calendar.day_bits, 179, 1) = "1" 
GROUP BY fplan_trip_bitfeld.fplan_trip_bitfeld_id
;
"""

        old_arr_times = self.__get_data_old(querry)
        new_arr_times = self.__get_data_new(querry)


        old_arr_dict = {el[0]: el[1] for el in old_arr_times if el[1] != ""}
        new_arr_dict = {el[0]: el[1] for el in new_arr_times if el[1] != ""}

        return_list = []

        for trip in old_arr_dict.keys():
            if not trip in new_arr_dict:
                continue
            if old_arr_dict[trip]  != new_arr_dict[trip]:
                old_time = old_arr_dict[trip]
                new_time = new_arr_dict[trip]

                return_list.append((f"{old_time[:2]}:{old_time[2:]}",
                                    f"{new_time[:2]}:{new_time[2:]}"))

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


if __name__ == "__main__":
    data = Data()

    print(data.get_time_diffs_bhf("8507000"))
