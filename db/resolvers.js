const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Clientes');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {

    const { id, email, nombre, apellido } = usuario;
    
    return jwt.sign( {id, email, nombre, apellido}, secreta, { expiresIn})
}


// Resolvers
const resolvers = {
    Query: {
        //Usuarios
        obtenerUsuario: async(_, { token }) => {
            const usuarioId = await jwt.verify(token, process.env.SECRETA);

            return usuarioId
        },
        //Productos
        obtenerProductos: async() => {
           try {
            const productos = Producto.find();

            return productos;
           } catch (error) {
               console.log(error);
           }
        },
        obtenerProducto: async (_, { id }) => {
            try {
                // revisar si el producto existe o no
                const producto = await Producto.findById(id);

                if(!producto){
                    throw new Error('Producto no encontrado');
                }

                return producto;
    
            } catch (error) {   
                throw new Error('Producto no encontrado');
            }
        }
    },
    Mutation: {
        nuevoUsuario: async (_, { input }) => {

            const { email, password } = input;

            // revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({ email });
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');
            }

            //Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);


            // Guardar en la base de datos
            try {
                const usuario = new Usuario(input);
                usuario.save(); // guardar
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },

        autenticarUsuario: async (_, {input}) => {

            const { email, password} = input;

            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            //  Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if(!passwordCorrecto) {
                throw new Error('El password es Incorrecto');
            }

            //  Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h')
            }

        },

        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto(input);

                //almacenar en la BD
                const resultado = await producto.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        
        actualizarProducto: async (_, {id, input}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);

            if(!producto){
                throw new Error('Producto no encontrado');
            }

            // guardarlo en la BD
            producto = await Producto.findByIdAndUpdate({ _id : id }, input, { new: true});

            return producto;
        },

        eliminarProducto: async (_, {id}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);

            if(!producto){
                throw new Error('Producto no encontrado');
            }

            // Eliminar
            await Producto.findByIdAndDelete({_id : id});

            return "Producto Eliminado";

        },

        nuevoCliente: async (_, { input }, ctx) => {
            
            const { email } = input;
            // Verificar si el cliente ya esta registrado
            

            const cliente = await Cliente.findOne({email});
            if(cliente){
                throw new Error('El cliente ya existe');
            }
            // asignar el vendedor
            const nuevoCliente = new Cliente(input);
            nuevoCliente.vendedor = ctx.usuario.id;
            // guardarlo en la base de datos

            try {
                //const nuevoCliente = new Cliente(input);
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        }

        

    }


}

module.exports = resolvers;