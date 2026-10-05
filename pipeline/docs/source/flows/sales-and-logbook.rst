=================
Sales and Logbook
=================

The ``Sales and Logbook`` flow ingests the zip files of raw xml messages deposited in the ``received`` folder of the
configured ``ERS_FILES_LOCATION`` (see :ref:`environment_variables`). For each zip file, it :

* extracts and parses the xml messages it contains
* loads **logbook** messages (ERS and FLUX formats) into the ``logbook_reports`` and ``logbook_raw_messages`` tables
* loads **sales notes** into the ``sales_notes`` and ``sales_notes_raw_messages`` tables
* moves the zip file to the ``treated`` folder, or to the ``error`` folder if it could not be processed

It is scheduled to run every 5 minutes.
