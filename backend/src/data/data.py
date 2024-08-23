import sqlite3 as sq

class Data():

    OLD_PATH = "data/hrdf_2024-01-03.sqlite"
    NEW_PATH = "data/hrdf_2024-02-21.sqlite"

    def __init__(self,):
        self.old_db = sq.connect(self.OLD_PATH)
        self.new_db = sq.connect(self.NEW_PATH)


    def get_bhfs(self,):
        """Return a list of all agencies with sublist: (id, name)
        """

        return self.__get_data_old("SELECT stop_id, stop_name from stops")

    def get_agency(self,):
        """Return a list of all agencies with sublist: (id, name, short_name)
        """

        return self.__get_data_old("SELECT agency_id, full_name_de, long_name from agency")





    def __get_data_old(self, statment):
        cur = self.old_db.cursor()

        cur.execute(statment)
        return cur.fetchall()


if __name__ == "__main__":
    data = Data()

    print(data.get_agency()[0])
    print(data.get_bhfs()[0])
