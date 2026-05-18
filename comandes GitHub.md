# Comandes GitHub

## Descàrrega d'un Projecte

- `git clone https://github.com/manelcolominas/EA-React.git`
- `git pull origin main` # Actualitzar amb l'última versió del projecte

## Treballar amb Versions i Etiquetes

- `git tag` # Mostra totes les versions (tags) disponibles
- `git checkout tags/<nom_tag>` # Canviar a una versió concreta

## Abans de Treballar en els Arxius

- `git pull origin main` # Per a descarregar-te la última versió del projecte

## Actualitzar Arxius a GitHub

- `git add .` # Afegir tots els fitxers al commit
- `git commit -m "Descripció breu dels canvis"` # Pujar els fitxers actualitzats
- `git push origin main`
- `git tag v1.0` # Afegir una versió al commit
- `git push origin v1.0` # Pujar la versió a GitHub

## Crear un Repositori Nou

- `mkdir <nom_projecte>`
- `cd <nom_projecte>/`
- `git init` # Inicia un nou repositori local (a l'ordinador)
- `rm -rf .git` # ⚠️ Elimina el repositori Git localment, a l'ordinador (no els fitxers!)

## Primer Commit

Per fer el primer commit d'un nou repositori creat des de la pàgina web de GitHub:

- `git init` # Inicia un nou repositori local (a l'ordinador)
- `git remote add origin https://github.com/manelcolominas/EA-React.git`
- `git branch -M main`
- `git add .` # Afegir tots els fitxers al commit
- `git commit -m "First Commit"`
- `git push -u origin main`

## Vincular un Directori a un Repositori de GitHub

- `git init`
- `git remote add origin https://github.com/manelcolominas/EA-JS.git`
- `git remote add origin https://github.com/manelcolominas/EA-TS.git`

## Treballar amb Branques

### Crear una Branca Nova

- `git checkout develop` # Canviar a la branca develop
- `git checkout -b nom_branca` # Crea la nova branca
- `git push -u origin nom_branca` # Puja-la a GitHub

### Merge

- `git switch develop` # Ves a develop
- `git pull` # Assegura't que està actualitzada
- `git merge feature2` # Fes el merge de feature2
- `git push` # Puja els canvis

## Resolució de Conflictes

Un **conflicte** es produeix quan tu i un company heu modificat les **mateixes línies** d'un mateix arxiu. Git no sap quina versió és la correcta i et demana que ho decideixis tu.

### Quan passa un conflicte?

Quan fas `git merge nom_branca` o `git pull` i Git detecta canvis incompatibles, t'avisa amb un missatge com:

```
CONFLICT (content): Merge conflict in arxiu.txt
Automatic merge failed; fix conflicts and then commit the result.
```

### Com es veu el conflicte dins l'arxiu?

Git marca el conflicte directament al fitxer amb uns separadors visuals:

```
<<<<<<< HEAD
  La teva versió del codi
=======
  La versió del teu company
>>>>>>> nom_branca
```

- `<<<<<<< HEAD` → el que tens **tu**
- `=======` → separador
- `>>>>>>> nom_branca` → el que té **el teu company**

### Com resoldre'l (pas a pas)

```bash
# 1. Veure quins arxius tenen conflicte
git status

# 2. Obrir l'arxiu i triar la versió correcta
#    (elimina els marcadors <<< === >>> i desa el fitxer)

# 3. Marcar el conflicte com a resolt
git add .

# 4. Fer el commit de la resolució
git commit -m "Resolt conflicte a arxiu.txt"

# 5. Pujar els canvis
git push origin main
```

> ⚠️ **Consell**: Per evitar conflictes, fes `git pull` **sempre** abans de començar a treballar i comunica't amb el teu company sobre qui toca cada arxiu.

## Git Stash

`git stash` és com un **calaix temporal** on pots deixar els canvis a mig fer per fer una altra cosa (canviar de branca, fer un pull...) i recuperar-los després.

### Quan s'utilitza?

Quan estàs treballant en una cosa i t'arriba una urgència, però els teus canvis no estan a punt per fer un commit. Amb `git stash` els guardes temporalment i deixes la zona de treball neta.

### Comandes principals

```bash
# Guardar els canvis actuals al stash
git stash

# Guardar el stash amb un nom descriptiu
git stash save "nom descriptiu"

# Veure tots els stash guardats
git stash list

# Recuperar el stash més recent (i eliminar-lo del stash)
git stash pop

# Recuperar el stash més recent (sense eliminar-lo del stash)
git stash apply

# Recuperar un stash concret
git stash apply stash@{2}

# Veure el contingut d'un stash sense aplicar-lo
git stash show

# Eliminar un stash concret
git stash drop stash@{0}

# Buidar tots els stash
git stash clear
```

### Diferència entre `pop` i `apply`

| Comanda           | Recupera els canvis | Elimina el stash |
| ----------------- | ------------------- | ---------------- |
| `git stash pop`   | Sí                  | Sí               |
| `git stash apply` | Sí                  | No               |

> ⚠️ **Consell**: El stash **no és un substitut dels commits**. Serveix per canvis temporals i puntuals, no per guardar feina a llarg termini.

## Conceptes Bàsics

- `git hash` -> És per saber si el contingut d'un objecte ha canviat o no. Per això guardarem els hash al git per saber si un projecte ha canviat o no o si esteu treballant en un mateix projecte
  igual.
- `git commit` # Així es com es diuen les versions a git
- `git status` # Mostra l'estat dels arxius (nous, modificats, preparats per commit).
- `git add <filename>` # Per afegir un cert arxiu
- `git commit -m "initial commit"` # Primer commit
- `git log` # Mostra l'historial de commits.
- `git push origin main` # Per a carregar els commits al repositori de github
- `git pull origin main` # Per a descarregar els arxius del repositori de github

## Altres Conceptes

- **Insights** -> Network graph
- **Merge** -> Juntar els canvis fets pel teu company i tu, unificar branques
- Git tindrà problemes quan treballem en el mateix arxiu

© Manel Colominas - Tots els drets reservats
