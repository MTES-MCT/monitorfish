from collections import defaultdict

import numpy as np
from faker import Faker


class DataAnonymizer(object):

    __faker = Faker("FR")

    def __init__(self, data_type: str = "cfr"):
        self.__cfr_dict = defaultdict(self.make_fake_cfr)
        self.__external_immatriculation_dict = defaultdict(
            self.make_fake_external_immatriculation
        )
        self.__mmsi_dict = defaultdict(self.make_fake_mmsi)
        self.__ircs_dict = defaultdict(self.make_fake_ircs)
        self.__vessel_name_dict = defaultdict(self.make_fake_vessel_name)
        self.__registry_port_dict = defaultdict(self.make_fake_port)
        self.__district_dict = defaultdict(self.make_fake_port)
        self.__district_code_dict = defaultdict(self.make_fake_district_code)

    # CFR
    def anonymize_cfr(self, value):
        return self.__cfr_dict[value] if value else value

    def anonymize_cfr_arr(self, values):
        return np.array([self.anonymize_cfr(value) for value in values])

    # External immatriculation
    def anonymize_external_immatriculation(self, value):
        return self.__external_immatriculation_dict[value] if value else value

    def anonymize_external_immatriculation_arr(self, values):
        return np.array(
            [self.anonymize_external_immatriculation(value) for value in values]
        )

    # MMSI
    def anonymize_mmsi(self, value):
        return self.__mmsi_dict[value] if value else value

    def anonymize_mmsi_arr(self, values):
        return np.array([self.anonymize_mmsi(value) for value in values])

    # IRCS
    def anonymize_ircs(self, value):
        return self.__ircs_dict[value] if value else value

    def anonymize_ircs_arr(self, values):
        return np.array([self.anonymize_ircs(value) for value in values])

    # Vessel name
    def anonymize_vessel_name(self, value):
        return self.__vessel_name_dict[value] if value else value

    def anonymize_vessel_name_arr(self, values):
        return np.array([self.anonymize_vessel_name(value) for value in values])

    # Registry port
    def anonymize_registry_port(self, value):
        return self.__registry_port_dict[value] if value else value

    def anonymize_registry_port_arr(self, values):
        return np.array([self.anonymize_registry_port(value) for value in values])

    # District
    def anonymize_district(self, value):
        return self.__district_dict[value] if value else value

    def anonymize_district_arr(self, values):
        return np.array([self.anonymize_district(value) for value in values])

    # District code
    def anonymize_district_code(self, value):
        return self.__district_code_dict[value] if value else value

    def anonymize_district_code_arr(self, values):
        return np.array([self.anonymize_district_code(value) for value in values])

    @classmethod
    def make_random_upper_case_letters(cls, n: int) -> str:
        return "".join([cls.__faker.random_uppercase_letter() for x in range(n)])

    @classmethod
    def make_fake_cfr(cls):
        fake_cfr = "ABC" + str(np.random.randint(0, 999999)).zfill(9)
        return fake_cfr

    @classmethod
    def make_fake_external_immatriculation(cls):
        fake_external_immatriculation = cls.make_random_upper_case_letters(2) + str(
            np.random.randint(0, 999999)
        ).zfill(6)
        return fake_external_immatriculation

    @classmethod
    def make_fake_mmsi(cls):
        fake_mmsi = str(np.random.randint(0, 999999999)).zfill(9)
        return fake_mmsi

    @classmethod
    def make_fake_ircs(cls):
        n_letters = cls.__faker.random_element(elements=(2, 3, 4))
        letters = cls.make_random_upper_case_letters(n_letters)
        digits = "" if n_letters == 4 else str(np.random.randint(0, 9999)).zfill(4)
        fake_ircs = letters + digits
        return fake_ircs

    @classmethod
    def make_fake_vessel_name(cls):
        return " ".join(cls.__faker.words(3)).upper()

    @classmethod
    def make_fake_port(cls):
        return cls.__faker.city()

    @classmethod
    def make_fake_district_code(cls):
        return cls.make_random_upper_case_letters(2)
