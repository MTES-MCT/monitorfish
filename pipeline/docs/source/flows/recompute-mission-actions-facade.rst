================================
Recompute mission actions facade
================================

The ``Recompute mission actions facade`` flow recomputes the facade (seafront) of all mission actions of a given year,
following the same logic as the backend :

* the facade of sea and air controls is deduced from their position
* the facade of land controls is that of the port where they took place
* other actions (air surveillance, observation) are not assigned a facade

This is useful when facade areas or the facade of ports change. It is run manually.
