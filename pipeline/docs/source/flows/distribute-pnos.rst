===============
Distribute pnos
===============

The ``Distribute pnos`` flow :

* generates pdf documents for all manual and logbook PNOs which have not yet been generated and loads them into the 
  ``prior_notification_pdf_documents`` table
* sends PNOs by email and text message to control units, respecting control units subscriptions to ports, fleet segments 
  and vessels (see :doc:`../control-units`)
* logs sent messages in the ``prior_notification_sent_messages`` table, which is used to display the sending history of 
  each PNO in the app

It is scheduled to run every minute, on PNOs of the last 5 days.

See :doc:`../prior-notifications`.
