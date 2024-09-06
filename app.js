const express = require('express');
const bodyParser = require('body-parser');
const { sql, poolPromise } = require('./dbconfig'); //usa poolpromise para las credenciales de conexion 
const cors = require('cors'); //impide que la seguridad no le de acceso al puerto 4200 de angular

const app = express(); //invoca a express 
const port = 3000; // establece el puerto de conexion 

app.use(cors()); // cualquier puerto puede conectarse a la base de datos 


app.use(bodyParser.json()); //da la respuesta en un JSON
app.use(bodyParser.urlencoded({ extended: true }));
////////////////////////////////////////////////////////////////////
app.get('/clientes', async (req, res) => { //el endpoint es clientes con un get 
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT C.Customer AS Cliente, C.Name AS Nombre FROM Customer C');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////////////////////////////////////////
app.get('/clientes/:customerId', async (req, res) => { //busca un customer por ID
    const customerId = req.params.customerId;
    const query = `
        SELECT
            c.Customer,
            c.Customer_Since,
            c.Terms,
            con.Contact_Name,
            con.Title,
            con.Phone,
            con.Email_Address
        FROM
            Customer c
        INNER JOIN Contact con ON c.Customer = con.Customer
        WHERE
            c.Customer = @customerId
        ORDER BY
            con.Contact_Name;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('customerId', sql.VarChar, customerId)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
/////////////////////////////////////////////////////////////////
app.get('/ordenes', async (req, res) => { //el endpoint es clientes con un get 
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT h.Customer, h.Sales_Order, h.Order_Date, h.Promised_Date, c.Name FROM SO_Header h JOIN Customer c ON h.Customer = c.Customer ORDER BY h.Customer, h.Sales_Order;');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
/////////////////////////////////////////////////////////////////
app.get('/ordenes/abiertas', async (req, res) => { //filtra solo las ordenes de venta abiertas
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT h.Customer, h.Sales_Order, h.Order_Date, h.Promised_Date, h.status, c.Name 
            FROM SO_Header h 
            JOIN Customer c ON h.Customer = c.Customer 
            WHERE h.status = 'Open' 
            ORDER BY h.Customer, h.Sales_Order, c.Name;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////////////////////////////////
app.get('/ordenes/cerradas', async (req, res) => { 
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT h.Customer, h.Sales_Order, h.Order_Date, h.Promised_Date, h.status, c.Name 
            FROM SO_Header h 
            JOIN Customer c ON h.Customer = c.Customer 
            WHERE h.status = 'Closed' 
            ORDER BY h.Customer, h.Sales_Order, c.Name;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////////////////////////////////////////////////
app.get('/rfqs', async (req, res) => {
    const query = `
      SELECT
        rfq.*,
        uv.Text1,
        c.Name,
        YEAR(rfq.Quote_Date) as Año,
        MONTH(rfq.Quote_Date) as Mes
      FROM
        RFQ rfq
      LEFT JOIN
        Customer c ON rfq.Customer = c.Customer
      LEFT JOIN
        User_Values uv ON c.User_Values = uv.User_Values
    `;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(query);
      res.json(result.recordset);  // Retorna todos los resultados
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
/////////////////////////////////////////////////////////////////////////////////////
app.get('/rfq/:rfqId', async (req, res) => {
    const rfqId = req.params.rfqId;
    const query = `
      SELECT
        rfq.*,
        uv.Text1,
        c.Name,
        YEAR(rfq.Quote_Date) as Año,
        MONTH(rfq.Quote_Date) as Mes
      FROM
        RFQ rfq
      LEFT JOIN
        Customer c ON rfq.Customer = c.Customer
      LEFT JOIN
        User_Values uv ON c.User_Values = uv.User_Values
      WHERE
        rfq.RFQ = @rfqId
    `;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('rfqId', sql.VarChar, rfqId)
        .query(query);
      res.json(result.recordset[0]);  // Retorna el primer (y único) resultado
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
//////////////////////////////////////////////////////////////////////////
app.get('/distribuidores', async (req, res) => {
    const query = `
        SELECT
            c.Customer,
            c.Name AS Customer_Name,
            c.Sales_Code,
            c.Pricing_Level,
            a.City,
            a.State
        FROM
            Customer c
        JOIN
            Address a ON c.Customer = a.Customer
        ORDER BY
            c.Customer;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


//////////////////////////////////////////////////////////////////////
app.get('/clientes/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const query = `
        SELECT
            c.Customer,
            c.Customer_Since,
            c.Terms,
            con.Contact_Name,
            con.Title,
            con.Phone,
            con.Email_Address,
            addr.Line1,
            addr.Line2,
            addr.City
        FROM
            Customer c
        INNER JOIN Contact con ON c.Customer = con.Customer
        LEFT JOIN Address addr ON c.Customer = addr.Customer
        WHERE
            c.Customer = @customerId
        ORDER BY
            con.Contact_Name;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('customerId', sql.VarChar, customerId)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
/////////////////////////////////////////////////////////////
app.get('/contactos', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT Contact_Name, Customer FROM Contact');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////////////////////////////////////
app.get('/contactos/:contactName', async (req, res) => {
    const contactName = req.params.contactName;
    const query = `
        SELECT
            ContactKey,
            Contact,
            Customer,
            Vendor,
            Address,
            Contact_Name,
            Title,
            Phone,
            Phone_Ext,
            Fax,
            Email_Address,
            Last_Updated,
            Cell_Phone,
            NET1_Contact_ID,
            Default_Invoice_Contact,
            Status
        FROM
            Contact
        WHERE
            Contact_Name = @contactName;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('contactName', sql.VarChar, contactName)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
/////////////////////////////////////////////////////////////////////
// Endpoint para insertar datos en la tabla Prospectos //////////////
app.post('/prospectos', async (req, res) => {
    const { Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status } = req.body;

    const query = `
        INSERT INTO Prospectos
        (Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status)
        VALUES
        (@Nota, @First_Name, @Last_Name, @Celular, @Phone, @Ubicacion, @Zona, @Tipo, @Date, @Email, @Company, @Status)
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Nota', sql.NVarChar(sql.MAX), Nota)
            .input('First_Name', sql.NVarChar(255), First_Name)
            .input('Last_Name', sql.NVarChar(255), Last_Name)
            .input('Celular', sql.BigInt, Celular)
            .input('Phone', sql.BigInt, Phone)
            .input('Ubicacion', sql.NVarChar(255), Ubicacion)
            .input('Zona', sql.NVarChar(255), Zona)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Date', sql.DateTime, Date)
            .input('Email', sql.NVarChar(255), Email)
            .input('Company', sql.NVarChar(255), Company)
            .input('Status', sql.NVarChar(50), Status)
            .query(query);

        res.status(201).send({ message: 'Prospecto insertado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al insertar el prospecto', error: err.message });
    }
});
////////////////////////////ELIMINAR PROSPECTOS/////////////////////////////////////////////////////////
app.delete('/prospectos/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM Prospectos
        WHERE id = @id
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        res.status(200).send({ message: 'Prospecto eliminado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar el prospecto', error: err.message });
    }
});
/////////////////////////////////////////ACTUALIZAR//////////////////////////////////////////////////////////
app.put('/prospectos/:email', async (req, res) => {
    const { email } = req.params;
    const { Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Company, Status } = req.body;

    const query = `
        UPDATE Prospectos
        SET Nota = @Nota,
            First_Name = @First_Name,
            Last_Name = @Last_Name,
            Celular = @Celular,
            Phone = @Phone,
            Ubicacion = @Ubicacion,
            Zona = @Zona,
            Tipo = @Tipo,
            Date = @Date,
            Company = @Company,
            Status = @Status
        WHERE Email = @Email
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Email', sql.NVarChar(255), email)
            .input('Nota', sql.NVarChar(sql.MAX), Nota)
            .input('First_Name', sql.NVarChar(255), First_Name)
            .input('Last_Name', sql.NVarChar(255), Last_Name)
            .input('Celular', sql.BigInt, Celular)
            .input('Phone', sql.BigInt, Phone)
            .input('Ubicacion', sql.NVarChar(255), Ubicacion)
            .input('Zona', sql.NVarChar(255), Zona)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Date', sql.DateTime, Date)
            .input('Company', sql.NVarChar(255), Company)
            .input('Status', sql.NVarChar(50), Status)
            .query(query);

        res.status(200).send({ message: 'Prospecto actualizado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar el prospecto', error: err.message });
    }
});
///////////////////////////////////////////OBTENER PROSPECTOS/////////////////////////////////////
app.get('/prospectos', async (req, res) => {
    const query = `
        SELECT
            Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status
        FROM Prospectos
    `;

    try {
        const pool = await poolPromise;
        const result = await pool.request().query(query);

        res.status(200).send(result.recordset);
    } catch (err) {
        res.status(500).send({ message: 'Error al obtener los prospectos', error: err.message });
    }
});
//////////////////////////prospectos by id////////////////////////////////////////////////////////////////
app.get('/prospectos/:email', async (req, res) => {
    const { email } = req.params;

    const query = `
        SELECT Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status
        FROM Prospectos
        WHERE Email = @Email
    `;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar(255), email)
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).send({ message: 'Prospecto no encontrado' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Error al obtener el prospecto', error: err.message });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Endpoint para actualizar prospecto por ID
app.put('/prospectos/:id', async (req, res) => {
    const { id } = req.params;
    const { Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status } = req.body;

    const query = `
        UPDATE Prospectos
        SET Nota = @Nota,
            First_Name = @First_Name,
            Last_Name = @Last_Name,
            Celular = @Celular,
            Phone = @Phone,
            Ubicacion = @Ubicacion,
            Zona = @Zona,
            Tipo = @Tipo,
            Date = @Date,
            Email = @Email,
            Company = @Company,
            Status = @Status
        WHERE id = @Id
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Nota', sql.NVarChar(sql.MAX), Nota)
            .input('First_Name', sql.NVarChar(255), First_Name)
            .input('Last_Name', sql.NVarChar(255), Last_Name)
            .input('Celular', sql.BigInt, Celular)
            .input('Phone', sql.BigInt, Phone)
            .input('Ubicacion', sql.NVarChar(255), Ubicacion)
            .input('Zona', sql.NVarChar(255), Zona)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Date', sql.DateTime, Date)
            .input('Email', sql.NVarChar(255), Email)
            .input('Company', sql.NVarChar(255), Company)
            .input('Status', sql.NVarChar(50), Status)
            .query(query);

        res.status(200).send({ message: 'Prospecto actualizado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al actualizar el prospecto', error: err.message });
    }
});
//////////////////////////////// Endpoint para obtener prospecto por ID /////////////////////////////////////////////////////
app.get('/prospectos/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT Nota, First_Name, Last_Name, Celular, Phone, Ubicacion, Zona, Tipo, Date, Email, Company, Status
        FROM Prospectos
        WHERE id = @Id
    `;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset[0]);
        } else {
            res.status(404).send({ message: 'Prospecto no encontrado' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Error al obtener el prospecto', error: err.message });
    }
});
////////////////////////////BORRAR POR EMAIL///////////////////////////////////////////////////////////////////////
app.delete('/prospectos/:email', async (req, res) => {
    const { email } = req.params;

    const query = `
        DELETE FROM Prospectos
        WHERE Email = @Email
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Email', sql.NVarChar(255), email)
            .query(query);

        res.status(200).send({ message: 'Prospecto eliminado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar el prospecto', error: err.message });
    }
});
///////////////////////////////////BORRAR POR ID ESPERO QUE FUNCIONE//////////////////////////////////////////////////////////////////////
app.delete('/prospectos/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM Prospectos
        WHERE id = @id
    `;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        res.status(200).send({ message: 'Prospecto eliminado correctamente' });
    } catch (err) {
        res.status(500).send({ message: 'Error al eliminar el prospecto', error: err.message });
    }
});
////////////////////////////////////GRAFICA PARA STATUS/////////////////////////////////////////////////////////////
app.get('/status', async (req, res) => {
    const query = `
        SELECT
            SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) AS won_count,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_count,
            SUM(CASE WHEN status = 'Lost' THEN 1 ELSE 0 END) AS lost_count,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count
        FROM rfq;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(query);
        res.json(result.recordset[0]);  
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////GRAFICA OV PARA VENTAS///////////////////////////////////////////////////////////////////////////
app.get('/ventas', async (req, res) => {
    const query = `
        SELECT 
            CASE 
                WHEN sales_rep = '2516' THEN 'Joel Xocotzin Granados'
                WHEN sales_rep = '2774' THEN 'Itzia Valeria Valadez Montoya'
                WHEN sales_rep = '163' THEN 'Daysi Ramírez Córdoba'
                WHEN sales_rep = '2727' THEN 'Carlos Isaias Díaz de la Peña'
                WHEN sales_rep = '22279' THEN 'Alondra Cabrera'
            END AS sales_rep,
            SUM(total_price) AS total_sales
        FROM SO_Header
        WHERE sales_rep IN ('2516', '2774', '163', '2727', '22279')
        GROUP BY sales_rep;
    `;
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
/////////////////////////////////ESTO NOS SIRVE PARA MOSTRAR LOS DETALLES FINALES//////////////////////////////////////////////////////////////////
app.get('/clientes/detalles-finales/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const query = `
        SELECT 
            C.Terms,
            C.Tax_Code,
            C.Status,
            C.Ship_Lead_Days,
            C.Credit_Limit,
            C.Curr_Balance,
            C.Customer_Since,
            C.Accept_BO,
            C.Currency_Def,
            C.Last_Updated AS Customer_Last_Updated,
            C.Tax_ID,
            C.Rating,
            C.Send_Report_By_Email,
            C.PST_ID,
            A.Line1,
            A.Line2,
            A.City,
            A.State
        FROM 
            Customer C
        JOIN 
            Address A ON C.Customer = A.Customer
        WHERE 
            C.Customer = @customerId;
    `;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('customerId', sql.VarChar, customerId)
            .query(query);
        res.json(result.recordset[0]);  
    } catch (err) {
        res.status(500).send(err.message);
    }
});
//////////////////////////////////////////BARRA DE BUSCADOR//////////////////////////////////////////////////////////
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const searchQuery = `
      SELECT
        rfq.*,
        uv.Text1,
        c.Name,
        YEAR(rfq.Quote_Date) as Año,
        MONTH(rfq.Quote_Date) as Mes
      FROM
        RFQ rfq
      LEFT JOIN
        Customer c ON rfq.Customer = c.Customer
      LEFT JOIN
        User_Values uv ON c.User_Values = uv.User_Values
      WHERE
        rfq.RFQ LIKE '%' + @query + '%' OR
        c.Name LIKE '%' + @query + '%'
    `;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('query', sql.VarChar, query)
        .query(searchQuery);
      res.json(result.recordset);  // Retorna todos los resultados
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`); //el app esta corriendo en el puerto 3000
});
