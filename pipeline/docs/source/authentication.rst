Authentication & authorization
================================

Authentication
--------------

Users are authenticated with OpenID Connect (OIDC), through `ProConnect <https://www.proconnect.gouv.fr>`__ 
(which federates the identity providers of the French administration, including Cerbère).

* backend : the backend is an OIDC client (Spring Security ``oauth2Login``). The frontend redirects the user to 
  ``/oauth2/authorization/proconnect`` ; after a successful login, the backend opens a session for the user (see 
  `Access rule`_ below).
* frontend : the login page shows a ProConnect or a Cerbère login button (``FRONTEND_OIDC_LOGIN_BUTTON_PROVIDER``). 
  Users without an account are invited to request one by email.

Authentication can be disabled (e.g. for local development) with the ``monitorfish.oidc.enabled`` property.

Access rule
-----------

At login, a user is accepted if :

* their email is registered in the ``user_authorizations`` table (super users, and external users of the Douane, Gendarmerie maritime and Gendarmerie nationale), or
* they come from Cerbère (ProConnect ``idp_id`` equal to ``MONITORFISH_OIDC_CERBERE_IDP_ID``, defaulting to ``4106b71b-094a-48f0-974a-cb2c2a9649b3``) and their
  ``organizational_unit`` is equal to, or starts with ``<unit>/``, one of the units of the 
  ``authorized_organizational_units`` table (e.g. ``DAM/DPMA`` accepts ``DAM/DPMA/CNSP``).

The rule can be disabled for local development with ``MONITORFISH_OIDC_BYPASS_LOGIN_FILTER``.

Authorization
-------------

We store users authorization in a custom ``user_authorizations`` table : the hashed email (SHA256) of the user is used 
to authorize users, and the plain email and administration are stored to list users. Each user is either :

* a **super user** (FMC agents), who has access to all features
* a regular user (other administrations, e.g. control units), who has access to a subset of features

See :doc:`access-rights` for the features available to each type of user.

Routes of the frontend API (``/bff/v1/*``) require an authorized user, and some routes require a super user.
User management routes (``MONITORFISH_API_PROTECTED_ADMINISTRATOR_PATHS``) require a super user who is also an
**administrator**. Only administrators see the backoffice "Utilisateurs" page.

Users are managed :

* in the backoffice ("Utilisateurs" page, which also shows the last login date of each listed user and lets 
  administrators grant or remove the administrator rights of CNSP users) : a user (CNSP with its service, or external with its administration) can be 
  added one by one. During the authorizations review, the list of emails of an external administration 
  (pasted, or imported from a CSV file) replaces its users. The authorized Cerbère organizational units are also managed there ;
* by other applications through the ``/api/v1/authorization/management`` endpoint of the public API.

Public API
----------

Protected routes of the public API (``/api/v1/*``), used by other systems (Monitorenv, RapportNav...), require an API key 
sent in the ``x-api-key`` header.
