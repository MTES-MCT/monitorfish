====================
Regulations check-up
====================

The ``Regulations check-up`` flow performs a daily check on the data of the ``legipeche`` and ``regulations`` tables. Checks made are :

* summary of the changes made in ``legipeche`` in articles referenced in ``regulations``
* presence of regulated zones without a regulatory reference in ``regulations``
* presence of dead links in a regulatory reference in ``regulations``
* presence of outdated regulations in ``regulations``

A summary of the check-up is sent by email to the regulations team.

It is scheduled to run every day.