const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment')


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({

            include: [
                {association:'genres'},
                {association: 'actors'}
            ]
        })
            .then(movies => {
                
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
      
      
        db.Genre.findAll({ // traigo todos los generos
            order:[
                ['name','ASC'] // con los nombres ordenados ascendentemente
            ]
        })
        .then(genres=>{
           // return res.send(genres) // siempre probar si devuelve lo q vos esperas
            return res.render("moviesAdd",{ // cuando findAll capture todos los generos, recien ahi los muestro en la vista
                genres
            })
        })
        .catch (error => console.log(error)) // si tengo errores, los capturo y los muestro
      
    },
    create: function (req, res) {
        //return res.send(req.body) // verifico lo q me trae el form
        
        const {title,awards,release_date,genre_id,rating,length}=req.body //desestructuracion de lo que viene por el formulario
        db.Movie.create({  // guardo lo que me viene por formulario
            title:title.trim(),
            awards:+awards,
            release_date,
            rating:+rating,
            length:+length,
            genre_id:+genre_id
        })
        
        .then(movie=> { // cuando obtenga la informacion del metodo create , muestro la pelicula 
            console.log(movie);
            return res.redirect('/movies/detail/' + movie.id) //redireccion a la vista detalle de la pelicula creada
            //return res.redirect('/movies')// o redireccion a todas las peliculas
        })

        .catch(error=>{ // capturo errores en caso de haberlos
            console.log(error);
        })
    },
    edit: function(req, res) {
        //guardo las promesas en variables
         let movie =db.Movie.findByPk(req.params.id) // guardo en una variable la pelicula cuyo id coincida con el q me viene por url
         let genres =db.Genre.findAll({ 
            order :[ 'name']
         })
        //recibo todas las promesas 
       Promise.all([movie,genres])
         .then(([movie,genres])=> { // envio la informacion que me viene al ejecutarse las promesas

        return res.render('moviesEdit',{
            Movie : movie,
            release_date : moment(movie.release_date).format('YYYY-MM-DD'), // mando  formato en que el input espera recibir la informacion
            genres,
        })
       })
       .catch(error=> console.log(error));
    },
    update: function (req,res) {
       //return res.send(req.body)
      /* Destructuring the req.body and then updating the movie with the new values. */
       const {title,awards,release_date,genre_id,rating,length}=req.body
        db.Movie.update(
        {
            title:title.trim(),
            awards:+awards,
            release_date,
            rating:+rating,
            length:+length,
            genre_id:+genre_id
        },
        {

            /* A condition to delete the movie with the id that comes from the url. */
            where :{
                id : req.params.id
            }

        })
        /* Redirecting to the detail page of the movie that was just updated. */
        .then(()=> res.redirect('/movies/detail/'+ req.params.id))
        /* Catching errors. */
        .catch(error=> console.log(error))
        
    },
    delete: function (req, res) {
        db.Movie.findByPk(req.params.id) // capturo el id que me viene por url
        .then(movie=>res.render('moviesDelete',{ // redirigo a la vista de la pelicula que quiero borrar
            movie // paso la informacion de la pelicula en cuestion
        }))
        .catch(error=> console.log(error)); // capturo errores
        
        

    },
    destroy: function (req, res) {
      // return res.send(req.params.id)

      db.Movie.destroy({ //uso el metodo destroy
        where:{ //IMPORTANTE EL WHERE
            id: req.params.id // pasar el id de la pelicula que quiero borrar
        }
      })
      .then(()=>res.redirect('/movies')) //redireccion a la vista de las peliculas
      .catch(error=>console.log(error));//capturo los errores
    }

}

module.exports = moviesController;