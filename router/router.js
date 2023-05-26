import express from 'express';
import request from 'request';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
    res.render('main', { layout: 'index' });
})

router.get('/overview', (req, res) => {
    request(`https://www.rijksmuseum.nl/api/nl/collection/?key=${process.env.API_KEY}&ps=10&imgonly=True`, { json: true }, function (err, response, data) {
        if (err) {
            res.send(err);
            console.error('error:', err);
        } else {
            const artPieces = data.artObjects;
            const transformedArtPieces = artPieces.map((artPiece) => {
                return {
                    id: artPiece.id,
                    title: artPiece.title,
                    image: artPiece.webImage.url
                };
            });

            res.render('overview', { layout: 'index', data: transformedArtPieces, title: 'Overzicht' });
        }
    })
});

router.get('/details/:id', (req, res) => {
    console.log("test params", req.params.id);
    const idWithPrefix = req.params.id;
    const id = idWithPrefix.replace('nl-', '');
  
    request(`https://www.rijksmuseum.nl/api/nl/collection/${id}?key=${process.env.API_KEY}`, { json: true }, function (err, response, data) {
      if (err) {
        res.send(err);
        console.error('error:', err);
      } else {
        const details = data.artObject;
  
        const transformedDetails = {
          id: details.id,
          title: details.title,
          image: details.webImage.url,
          info: details.description,
          tags: details.objectTypes
        };
  
        res.render('details', { layout: 'index', data: transformedDetails, title: 'Details' });
      }
    });
  });


  router.get('/categorie/:type', (req, res) => {
    const typeArt = req.params['type'];
  
    request(`https://www.rijksmuseum.nl/api/nl/collection/?key=${process.env.API_KEY}&type=${typeArt}&imgonly=True`,
      { json: true },
      function (err, response, data) {
        if (err) {
          res.send(err);
          console.error('error:', err);
        } else {
          const specificArtPieces = data.artObjects;
          const transformedArtPieces = specificArtPieces.map((artPiece) => {
            return {
                id: artPiece.id,
                title: artPiece.title,
                image: artPiece.webImage.url
            };
          });
  
          res.render('category', { layout: 'index', data: transformedArtPieces, categorie: typeArt, title: 'Categorie' });
        }
      }
    )
  });


router.get('/zoeken', (req, res) => {
    res.render('search', { layout: 'index', title: 'Zoeken' });
});

router.post('/zoekresultaten', async (req, res) => {
    const inputSearchTerm = req.body.zoeken;
    console.log("inputSearchTerm", inputSearchTerm);
    request(`https://www.rijksmuseum.nl/api/nl/collection/?key=${process.env.API_KEY}&q=${inputSearchTerm}&imgonly=True`,
      { json: true },
      function (err, response, data) {
        if (err) {
          res.send(err);
          console.error('error:', err);
        } else {
          const specificArtPieces = data.artObjects;
          const transformedArtPieces = specificArtPieces.map((artPiece) => {
            return {
                id: artPiece.id,
                title: artPiece.title,
                image: artPiece.webImage.url,
                objectNumber: artPiece.objectNumber
            };
          });
  
          res.render('search', { layout: 'index', data: transformedArtPieces, title: 'Zoekresultaten' });
        }
      }
    )
  });



router.get('/offline', (req, res) => {
    res.render('offline', { layout: 'index', title: 'Offline' });
});


export { router };