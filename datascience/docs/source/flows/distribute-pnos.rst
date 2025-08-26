===============
Distribute pnos
===============

The ``Distribute pnos`` flow :

* generates pdf documents for all manual and logbook PNOs which have not yet generated and loads them into the ``prior_notification_pdf_documents`` table.
* sends PNOs by email and text message to control units, respecting control units subscriptions to ports, fleet segments, and vessels