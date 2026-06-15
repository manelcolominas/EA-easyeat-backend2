# EASY-EAT API

## 💻 Regles del Backend

> ⚠️ Seguint aquestes regles protegim la feina de tots, evitem errors inesperats i mantenim un backend robust, intel·ligible i escalable. 💪

1. **Els endpoints NO HAN de canviar la seva estructura de resposta** un cop definits finalment. Això protegeix la feina de tots i evita inconsistències.
2. **Nous requisits → nous endpoints.** Per a nous requisits, prioritza reutilitzar endpoints existents sempre que tingui sentit. Si cal un petit ajust que no alteri l'estructura de la resposta,
   endavant. Però si el canvi modifica significativament la resposta retornada, s'hauria de crear un endpoint. sempre mirar de fer el més òptim per al sitema.
3. **Totes les respostes HAN de seguir l'estructura estàndard acordada.**
4. **No es fan canvis directes a la branca de desenvolupament**; sempre treballar en noves branques.
5. **El backend NO HA de ser modificat per adaptar-se a necessitats puntuals del frontend**; el frontend s'ha d'adaptar al backend.
6. **Responsabilitat plena:** Si un company toca alguna cosa i el sistema deixa de funcionar (tant frontend com backend), és responsabilitat seva arreglar el problema que ha causat.

---

## Descripció

L'API REST d'EASY-EAT és una aplicació backend desenvolupada amb Node.js, TypeScript i MongoDB per gestionar restaurants, clients, ressenyes, recompenses i visites. Aquesta API proporciona una
plataforma completa per a aplicacions de gestió de restaurants i sistemes de fidelització de clients.

## Característiques

- **Gestió de Restaurants**: Crear, llegir, actualitzar i eliminar restaurants amb informació detallada (horaris, categories, valoracions, etc.)
- **Sistema de Clients**: Gestió completa de perfils de clients
- **Ressenyes i Valoracions**: Permet als clients deixar ressenyes als restaurants
- **Sistema de Recompenses**: Gestió de recompenses i punts de fidelització
- **Seguiment de Visites**: Registre de visites dels clients als restaurants
- **Documentació API**: Documentació interactiva amb Swagger UI
- **Validació de Dades**: Validació robusta amb Joi
- **Autenticació Segura**: Hashing de contrasenyes amb bcrypt
- **Dades de Prova**: Sistema de seeding per poblar la base de dades amb dades d'exemple

## Tecnologies Utilitzades

- **Node.js** - Entorn d'execució JavaScript
- **TypeScript** - Superset de JavaScript amb tipat estàtic
- **Express.js** - Framework web per Node.js
- **MongoDB** - Base de dades NoSQL
- **Mongoose** - ODM per MongoDB
- **Swagger/OpenAPI** - Documentació d'API
- **Joi** - Validació d'esquemes
- **bcrypt** - Hashing de contrasenyes
- **CORS** - Suport per Cross-Origin Resource Sharing

## Requisits previs

- Node.js (versió 14 o superior)
- MongoDB (local o en la núvol)
- npm o yarn

## Instal·lació

1. Clona el repositori:

```bash
git clone <url-del-repositori>
cd EA-easyeat-backend2
```

2. Instal·la les dependències:

```bash
npm install
```

3. Configura les variables d'entorn: Crea un fitxer `.env` a l'arrel del projecte amb les següents variables:

```env
MONGO_URI=mongodb://localhost:27017/easyeat
SERVER_PORT=1337
```

4. Compila el projecte:

```bash
npm run build
```

## Ús

### Iniciar el servidor

```bash
npm start
```

El servidor s'iniciarà al port especificat (per defecte 1337) i es connectarà automàticament a MongoDB. També poblarà la base de dades amb dades d'exemple.

### Endpoints principals

- **Restaurants**: `/restaurants`
- **Ressenyes**: `/reviews`
- **Clients**: `/customer`
- **Recompenses**: `/rewards`
- **Visites**: `/visits`

### Documentació API

Accedeix a la documentació interactiva de l'API a:

```
http://localhost:1337/api
```

### Health Check

Pots verificar que el servidor estigui funcionant correctament amb:

```
GET http://localhost:1337/ping
```

## Estructura del Projecte

```
EA-easyeat-backend2/
├── src/
│   ├── config/          # Configuració de l'aplicació
│   │   └── config.ts
│   ├── controllers/     # Controladors de l'APIç
│   │   ├─── restaurant.ts
│   │   ├─── review.ts
│   │   ├─── customer.ts
│   │   ├─── reward.ts
│   │   ├─── visit.ts
│   │   ├─── badge.ts
│   │   ├─── dish.ts
│   │   ├─── rewardRedemption.ts
│   │   ├─── statistics.ts
│   │   ├─── pointsWallet.ts
│   │   ├─── dishRating.ts
│   │   └─── employee.ts
│   ├── models/          # Models de Mongoose
│   │   ├─── restaurant.ts
│   │   ├─── review.ts
│   │   ├─── customer.ts
│   │   ├─── reward.ts
│   │   ├─── visit.ts
│   │   ├─── badge.ts
│   │   ├─── dish.ts
│   │   ├─── rewardRedemption.ts
│   │   ├─── statistics.ts
│   │   ├─── pointsWallet.ts
│   │   ├─── dishRating.ts
│   │   └─── employee.ts
│   ├── routes/          # Definició de rutes
│   │   ├─── restaurant.ts
│   │   ├─── review.ts
│   │   ├─── customer.ts
│   │   ├─── reward.ts
│   │   ├─── visit.ts
│   │   ├─── badge.ts
│   │   ├─── dish.ts
│   │   ├─── rewardRedemption.ts
│   │   ├─── statistics.ts
│   │   ├─── pointsWallet.ts
│   │   ├─── dishRating.ts
│   │   └─── employee.ts
│   ├── services/        # Lògica de negoci
│   │   ├─── restaurant.ts
│   │   ├─── review.ts
│   │   ├─── customer.ts
│   │   ├─── reward.ts
│   │   ├─── visit.ts
│   │   ├─── badge.ts
│   │   ├─── dish.ts
│   │   ├─── rewardRedemption.ts
│   │   ├─── statistics.ts
│   │   ├─── pointsWallet.ts
│   │   ├─── dishRating.ts
│   │   └─── employee.ts
│   ├── middleware/      # Middleware personalitzat
│   │   └── joi.ts
│   ├── utils/           # Utilitats (seeding, recomanacions, etc.)
│   │   ├─── dataSeeder.ts
│   │   ├─── recommendation.ts
│   │   ├─── softDelete.ts
│   │   └─── servicePeriod.ts
│   ├── data/            # Dades JSON per seeding
│   │   ├─── restaurant.json
│   │   ├─── review.json
│   │   ├─── customer.json
│   │   ├─── reward.json
│   │   ├─── visit.json
│   │   ├─── badge.json
│   │   ├─── dish.json
│   │   ├─── rewardRedemption.json
│   │   ├─── statistics.json
│   │   ├─── pointsWallet.json
│   │   ├─── dishRating.json
│   │   └─── employee.json
│   ├── library/         # Utilitats compartides (logging)
│   │   └── logging.ts
│   ├── server.ts        # Punt d'entrada de l'aplicació
│   └── swagger.ts       # Configuració de Swagger
├── build/               # Fitxers compilats (generats automàticament)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts disponibles

- `npm run build` - Compila el projecte TypeScript
- `npm start` - Inicia el servidor en mode producció
- `npm run postinstall` - S'executa automàticament després de `npm install`

## Desenvolupament

Per desenvolupar amb recàrrega automàtica, pots utilitzar eines com `nodemon` o `ts-node-dev`. Assegura't de tenir MongoDB en funcionament localment o configura la URI de connexió adequada.

## Contribució

1. Fork el projecte
2. Crea una branca per la teva funcionalitat (`git checkout -b feature/nova-funcionalitat`)
3. Commit els teus canvis (`git commit -m 'Afegeix nova funcionalitat'`)
4. Push a la branca (`git push origin feature/nova-funcionalitat`)
5. Obre un Pull Request

## Llicència

Aquest projecte està sota la llicència MIT.

## Autor

Desenvolupat com a part del projecte d'Enginyeria d'Aplicacions.</content> <parameter name="filePath">
