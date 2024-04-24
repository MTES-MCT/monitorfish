echo "#########################################################################";
echo pg_hba.conf uncommented lines:;
echo "";
cat /var/lib/postgresql/data/pg_hba.conf | grep -v -e "^#" | grep -v -e "^$";

echo "#########################################################################";
echo postgresql.conf uncommented lines:;
echo "";
cat /var/lib/postgresql/data/postgresql.conf | grep -v -e "^\s*#" | grep -v -e "^$";


