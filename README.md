# Setup
Télécharger les fichiers LFS 
```bash
git lfs fetch
git lfs checkout
```

Installer l'extension `Dev Container` dans VSCode
Build le container de développement 
```bash
docker build . -f share/dev.dockerfile -t nataquashop/dev:latest
docker run -d -v $(pwd):/workspace -v ~/.ssh:/home/node/.ssh -p 3000-3050:3000-3050 --name nataquashop nataquashop/dev:latest 

# Arrêter / Démarrer / Lancer une console dans le container
docker stop nataquashop
docker start nataquashop
docker exec -it nataquashop bash
```

Attacher VSCode au container : F1 > Dev Containers: Attach to running container... > nataquashop
Une fois démarrer, faire "Open Folder > /workspace"
Installer les dépendances et démarrer le serveur
```bash
pnpm install
pnpm dev
```


Attributs : 
Déplacement des collections et club dans des tables spécifiques
    
Sync des images
```bash
sync -rav --prune-empty-dirs --exclude "_thumb" --exclude "*.php" --exclude "*.ini" --exclude "*flash*" --exclude "*img_color*" nataquashop@srv4006.sd-france.net:/home/nataqua/www/app/public/userfile/catalogue/produit produit -e 'ssh -p 22 -oHostKeyAlgorithms=+ssh-rsa
```

TODO :
 - Associer directement les attributs sur le modèle (supprimer la table de jonction)

```bash
split -l 100000 -d -a 1 05-commande_ligne.json  05-commande_ligne_ --additional-suffix=.json
```

```sql
delete from auth.users a where a.is_anonymous = true and a.updated_at < (now() - interval '14 days');
```

```sql
do $$ declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
    end loop;
end $$;
```

List all product pictures
```sh
echo $(find . -type f | jq -R . | jq -s .) > /tmp/produit_dirs.json
echo $(find . -type f | jq -R . | jq -s .) > /tmp/produit_files.json
```