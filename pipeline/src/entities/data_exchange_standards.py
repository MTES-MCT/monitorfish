from enum import Enum


class ZippedFileType(Enum):
    ERS3_JBE = "ERS3_JBE"
    ERS3_ACK_JBE = "ERS3_ACK_JBE"
    UN_JBE = "UN_JBE"
    UN_NVE = "UN_NVE"
    ERS3_NVE = "ERS3_NVE"


class TransmissionFormat(Enum):
    ERS = "ERS"
    FLUX = "FLUX"

    @staticmethod
    def from_zipped_file_type(t: ZippedFileType):
        mapping = {
            ZippedFileType.ERS3_JBE: TransmissionFormat.ERS,
            ZippedFileType.ERS3_ACK_JBE: TransmissionFormat.ERS,
            ZippedFileType.ERS3_NVE: TransmissionFormat.ERS,
            ZippedFileType.UN_JBE: TransmissionFormat.FLUX,
            ZippedFileType.UN_NVE: TransmissionFormat.FLUX,
        }
        return mapping[t]


class DataDomain(Enum):
    SALES = "SALES"
    LOGBOOK = "LOGBOOK"

    @staticmethod
    def from_zipped_file_type(t: ZippedFileType):
        mapping = {
            ZippedFileType.ERS3_JBE: DataDomain.LOGBOOK,
            ZippedFileType.ERS3_ACK_JBE: DataDomain.LOGBOOK,
            ZippedFileType.UN_JBE: DataDomain.LOGBOOK,
            ZippedFileType.UN_NVE: DataDomain.SALES,
            ZippedFileType.ERS3_NVE: DataDomain.SALES,
        }
        return mapping[t]
