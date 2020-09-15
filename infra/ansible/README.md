# Infrastructure

Ce dossier d'infrastructure a pour de contenir tout ce qui concerne l'infrastructure du projet.

### 1. Préambule sur Ansible
Pour installer et configurer les différentes VMs, Ansible a été utilisé. Ansible est un outil de configuration et de
gestion d'ordinateur, plus précisément serveur dans notre cas. On écrit un **playbook Ansible** (= suite d'instructions) et en lançant un playbook, Ansible va exécuter cette suite d'instructions sur les machines distantes qu'on lui indique en se connectant via SSH.

Le playbook étant une suite d'instructions, on peut découper cette suite d'insutrctions en plusieurs sous suite d'instructions pour le rendre plus lisible et découper les responsabilités : cette sous suite d'instruction est un **rôle Ansible**. Par exemple, on peut avoir un rôle qui installe Docker et un autre rôle qui installe la base de données.

Il est également possible de rajouter des **tags Ansible** sur des instructions ou des rôles Ansible pour les "marquer" et permettre de n'exécuter que ces instructions lors de l'exécution du playbook. Imaginons qu'on ne veuille relancer que l'instruction qui permet de re-configurer les paramètres de la base de données, on peut rajouter un tag à cette instruction et ne lancer que celle-ci.

Ansible n'a pas besoin d'être installé sur les machines distantes mais seulement sur la machine qui éxecute le playbook, en l'occurence ici le développeur ou l'OPS. Sur les machines distantes, le seul pré-requis est l'installation de Python (version 3 de préférence).

Dans ce projet, un playbook Ansible [ansible/initialize_platform.yml](ansible/initialize_platform.yml) a été écrit et il permet
d'installer et de configurer les VMs/machines pour le serveur sFTP.

Quand le playbook est exécuté, Ansible se connecte via SSH avec l'utilisateur **mf** pour exécuter les instructions
Ansible.

### 2. Pré-requis
- [Insaller Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html), au moins la
  version 2.9, sur la machine où sera exécuté le playbook (= donc pas sur les VMs). Vérifier qu'Ansible est bien
  installé avec le commande :
```bash
ansible --version
```

### 3. Instructions pour configurer les VMs pour les différents environnements
Certaines informations confidentielles (API keys, mots de passe, etc.) sont stockées dans des **vaults Ansible**.
Ce sont des fichiers cryptés protégés par un mot de passe. Le playbook [ansible/initialize_platform.yml](ansible/initialize_platform.yml)
a besoin de lire des informations des vaults Ansible. Il va donc falloir vous munir du mot de passe afin de pouvoir lancer
le playbook. Demandez le mot de passe à **Jean-Sebastien DUPUIS - js.dupuis@ffgolf.org**.

Note : Le mot de passe des vaults de PROD est différent de celui de DEV, SANDBOX et PREPROD.

### 4. Configuration des environnements

#### a. Configurer le serveur sFTP

Dans un terminal, exécuter :

```bash
# Depuis le dossier "infra"
ANSIBLE_CONFIG=ansible/ansible.cfg ansible-playbook -v -i ansible/inventories/dev/hosts ansible/initialize_platform.yml --user mf -kK --ask-vault-pass
```

### 5. Autre

Pour mettre à jour les rôles utilisés : `ansible-galaxy install -r ansible/requirements.yml -p ansible/roles/`
