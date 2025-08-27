==========================
Update beacon malfunctions
==========================

The ``Update beacon malfunctions`` flow identifies vessels with an activated beacon (supposed to emit) which have not been emitting for 
several hours. A beacon malfunction is generated and loaded to the ``beacon_malfunctions`` table for every occurrence of a beacon not emitting for a certain time. 
Data from this table is used in the app by the :doc:`../vms-beacon-monitoring` module.