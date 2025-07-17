import app from './app';
import dbClient from './knex';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

const port = process.env.PORT || 3000;
dbClient.migrate.latest()
.then(()=> {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error: any) => {
    console.log(error.message);
})