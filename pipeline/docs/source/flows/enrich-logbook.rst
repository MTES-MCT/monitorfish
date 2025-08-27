==============
Enrich logbook
==============

The ``Enrich logbook`` flow computes logbook PNOs' risk factor, and type - based on the PNO type 
definitions stored in ``pno_types`` and ``pno_type_rules`` - and loads the result back to the ``value`` field of the ``logbook`` table.