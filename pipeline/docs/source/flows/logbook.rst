=======
Logbook
=======

The ``Logbook`` flow processes logbook xml raw messages and inserts the parsed data into the ``logbook_reports`` 
and ``logbook_raw_messages`` tables of the Monitorfish database.

ERS and FLUX formats are supported.

It is scheduled to run every minute.