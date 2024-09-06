const sql = require('mssql'); //es la dependencia necesaria para establecer la conexion con sql server

const config = {
    user: 'sqlserver', //el usuario     
    password: '~_t)DBpE*D8$HHD_', //contraseña
    server: '34.174.13.165', //servidor 
    database: 'PRODUCTION', //la base datos es la siguiente 
    options: {
        encrypt: true, // Si usas Azure SQL, deberías dejarlo en true
        enableArithAbort: true,
        trustServerCertificate: true, // Agrega esta línea para desactivar la verificación del certificado
        connectTimeout: 30000 // Aumenta el tiempo de espera a 30 segundos
    }
};

const poolPromise = new sql.ConnectionPool(config) //usamos la conexion y las promesas 
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => console.log('Error al conectar a SQL Server', err));

module.exports = {
    sql, poolPromise
};