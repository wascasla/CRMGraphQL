const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const conectarDB = async () => {
    try {
        
    } catch (error) {
        console.log('Hubo un error');
        console.log(error);
        process.exit(1); //detener la app si no se conecta 
    }
}