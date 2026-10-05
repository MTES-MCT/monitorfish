Authentication & authorization
================================

Authentication
--------------

Users are authenticated with OpenID Connect (OIDC), through `ProConnect <https://www.proconnect.gouv.fr>`__ 
(which federates the identity providers of the French administration, including Cerbère).

* backend : the backend is an OIDC client (Spring Security ``oauth2Login``). The frontend redirects the user to 
  ``/oauth2/authorization/proconnect`` ; after a successful login, the backend opens a session for the user. Only 
  users whose email belongs to one of the authorized email domains are accepted.
* frontend : the login page shows a ProConnect or a Cerbère login button (``FRONTEND_OIDC_LOGIN_BUTTON_PROVIDER``). 
  Users without an account are invited to request one by email.

Authentication can be disabled (e.g. for local development) with the ``monitorfish.oidc.enabled`` property.

Authorization
-------------

We store users authorization in a custom ``user_authorizations`` table : the hashed email (SHA256) of the user is used 
to authorize users. Each user is either :

* a **super user** (FMC agents), who has access to all features
* a regular user (other administrations, e.g. control units), who has access to a subset of features

See :doc:`access-rights` for the features available to each type of user.

Routes of the frontend API (``/bff/v1/*``) require an authorized user, and some routes require a super user.

Users are managed by other applications through the ``/api/v1/authorization/management`` endpoint of the public API.

Public API
----------

Protected routes of the public API (``/api/v1/*``), used by other systems (Monitorenv, RapportNav...), require an API key 
sent in the ``x-api-key`` header.
