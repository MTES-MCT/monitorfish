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

* their email is registered in the ``user_authorizations`` table (super users, and external users of the Douane, Gendarmerie maritime and Gendarmerie nationale)
  **and** they log in with the expected ProConnect identity provider : Cerbère for super users, the DGDDI SSO
  (``MONITORFISH_OIDC_DOUANE_IDP_ID``) for the Douane, Extensso (``MONITORFISH_OIDC_EXTENSSO_IDP_ID``) for the
  Gendarmeries. The ``idp_id`` and ``sub`` of their first login are stored, and later logins must match them : the email
  alone is not trusted, as any identity provider of the ProConnect federation could assert it. To reset this binding
  (e.g. the user's account was recreated by its identity provider), delete and add the user again. Or
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
User management routes (``/bff/v1/admin/*``, always protected, and ``MONITORFISH_API_PROTECTED_ADMINISTRATOR_PATHS``)
require a super user who is also an **administrator**. Only administrators see the backoffice "Utilisateurs" and
"Journal des habilitations" pages. An administrator can't remove its own rights nor delete itself, and the last
administrator can't be removed.

Every change of the authorizations (users, administrator rights, authorized organizational units), made in the
backoffice or with the public API, is traced in the ``authorization_audit_logs`` table with its author, and displayed in
the backoffice "Journal des habilitations" page.

Session security
----------------

The session cookie is ``HttpOnly``, ``SameSite=Lax`` and ``Secure`` (``MONITORFISH_SESSION_COOKIE_SECURE``, ``true`` in
the remote deployment). Mutations on ``/bff`` require a CSRF token (``XSRF-TOKEN`` cookie sent back in the
``X-XSRF-TOKEN`` header by the frontend), and only the frontend origins (``MONITORFISH_OIDC_ALLOWED_ORIGINS``, defaulting
to the origin of ``MONITORFISH_OIDC_SUCCESS_URL``) can call it with CORS. The ``/api`` routes, called by other
applications with the API key, keep accepting any origin without CSRF token.

The ProConnect userinfo response (a signed JWT) is verified with the provider keys (``MONITORFISH_OIDC_JWK_SET_URI``),
and its ``sub`` must match the ID token's.

Users are managed :

* in the backoffice ("Utilisateurs" page, which also shows the last login date of each listed user and lets 
  administrators grant or remove the administrator rights of CNSP users) : a user (CNSP with its service, or external with its administration) can be 
  added one by one. During the authorizations review, the list of emails of an external administration 
  (pasted, or imported from a CSV file) replaces its users. The authorized Cerbère organizational units are also managed there (tab "Services autorisés (Cerbère)" : the
  ``organizational_unit`` claim is shown as the agent's *service*) ;
* super users reach the backoffice from the "Mon compte" panel of the map ("Accéder au backoffice", new tab) ;
* by other applications through the ``/api/v1/authorization/management`` endpoint of the public API.

Public API
----------

Protected routes of the public API (``/api/v1/*``), used by other systems (Monitorenv, RapportNav...), require an API key 
sent in the ``x-api-key`` header.
