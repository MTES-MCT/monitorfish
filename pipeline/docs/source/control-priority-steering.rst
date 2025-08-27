=========================
Control priority steering
=========================

Why it is needed
----------------

Reaching the :ref:`control objectives <risk-assessment>` defined at the national level is one of the missions 
of the FMC. In order to reach these objectives, the FMC needs a way to **target certain fleet segments** and to 
**dynamically adapt control priorities** depending on the level of achievement of the control objectives of each segment.

In addition to the control objectives, the **seasonality of the activity** on the various segments is another factor 
that makes it necessary for the FMC to be able to adapt its control priorities dynamically. Indeed, certain fleet 
segments are of particular interest at known periods in the year.

How it works
------------

The administration panel allows Monitorfish admins to steer control priorities by dynamically assigning 
a **control priority level** to each fleet segment :

====================== ======================
Control priority level Control priority level
====================== ======================
Low                    1
Moderate               2
High                   3
Very high              4
====================== ======================

The control priority level is then included  in the computation of 
the :ref:`detectability score <detectability-score>` component of the risk factor.
By assigning a higher control priority level to a certain fleet segment, the risk 
factor of all vessels belonging to this fleet segment in real time will be increased, 
and Monitorfish will automatically recommend control targets that correspond to this 
fleet segment, thus helping the FMC to reach its objectives.