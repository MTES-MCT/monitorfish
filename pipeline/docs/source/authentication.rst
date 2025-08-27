Authentication & authorization
================================

Authentication
--------------

We use OIDC (the French government OIDC called "Cerbère") to authenticate users.

* frontend: An Authorization Code Flow With Proof Key of Code Exchange (PKCE) is used in our frontend SPA to gather the `access_token`
* backend: Our backend is a seen as a Resource Server, the `access_token` is verified within an API security filter.

Authorization
-------------

We store users authorization is a custom `user_authorizations` table : the hashed email (SHA256) of the JWT email is used to authorize users.
