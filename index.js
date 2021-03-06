const express = require("express");
const fetch = require("node-fetch");
const modelManger = require("3d-model-manger");
const fs = require('fs');
const path = require('path');

const app = express();
const mmClasses = modelManger.classes
const modelPath = "views/RobloxR15.obj"

mmClassParse = {}
for (const property in mmClasses) {
  mmClassParse[property] = mmClasses[property].toString()
}



const rawObjRead = modelManger.readModel(modelPath)
const objData = modelManger.parseRead(rawObjRead)

let RawPackageJsonData
let PackageJsonError = false
let PackageJsonData

let ErrorData = []

try {
  RawPackageJsonData = fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8');
}
catch(error) {
  PackageJsonError = true
}
if (PackageJsonError == false) {
  try {
    PackageJsonData = JSON.parse(RawPackageJsonData);
  } catch(error) {
    PackageJsonError = true
  }
}

function recurseFindCopy(array, check, currentRecurse, options) {
  //console.log(`Starting recurseFindCopy${currentRecurse}!`)

  //console.log(array, check, currentRecurse, options)

  currentRecurse++;
  for (let i = 0; i < array.length; i++) {
    let value = array[i];
    console.log(value, i)

    let checkType = "===";
    let checkCap = 5;

    if (options != null) {
      checkType = (options.checkType != null) ? options.checkType : "===";

      checkCap = (options.checkCap != null) ? options.checkCap : 5;
    }

    //console.log(checkType, checkCap)

    valueIsArray = Array.isArray(value)
    if (checkType == "==" || checkType == 0) {

      if (valueIsArray == true && checkCap >= currentRecurse) {

        return [recurseFindCopy(value, check, currentRecurse, options), i]
      }

      else if (value == check) {
        return true;
      }

      else {
        return false;
      }
    }

    else if (checkType == "===" || checkType == 1) {

      if (valueIsArray === true && options.checkCap >= currentRecurse) {

        return [recurseFindCopy(value, check, currentRecurse, options), i]
      }

      else if (value === check) {
        return true;
      }

      else {
        return false;
      }
    }
  }
  //console.log(`Ending recurseFindCopy${currentRecurse}!`)
}

function FindCopy(array, check, options) {
  //console.log(`Starting!`)
  //console.log(array, check, options, recurseFindCopy(array, check, 1, options))
  return recurseFindCopy(array, check, 1, options)
}


function AddError(data) {
  if (data.code === null || data.from === null || data.messege === null) {
    throw new Error("Invaled params");
    return;
  }
  if (ErrorData[data.code] == null) {
    ErrorData[data.code] = [data];
  }
  else if(Array.isArray(ErrorData[data.code])) {
    if (ErrorData[data.code])
    ErrorData[data.code].push(data);
  }

}

AddError({code: 404, from: PackageJsonData.name, messege: "Invaled Url"})


app.use(express.static(__dirname + '/views'));

app.set('view engine', 'ejs');



function HandleError(req, res, errorcode) {
  // respond with html page
  if (req.accepts('html') == "html") {
    if (errorcode == 418) {
      res.render('Error', {url: req.url, ErrorCode: errorcode, GifAlt: "I AM A TEAPOT",GifLink: "https://media0.giphy.com/media/XJtpTFGatDgDTJhLtr/giphy.gif"});
      return;
    }
    res.render('Error', {url: req.url, ErrorCode: errorcode, GifAlt: "random pic", GifLink: "https://www.ikea.cn/cn/en/images/products/oumbaerlig-pot-with-lid__0710343_PE727464_S5.JPG"});
    return;
  }


  // respond with json
  if (req.accepts('json') == "json") {
    if (PackageJsonError == false) {
      if (ErrorData[errorcode]) {
        res.send(ErrorData[errorcode]);
        return;
      } else {
        res.send({ code: 500, from: PackageJsonData.name,messege: `No Errorcode found for Error ${errorcode}`});
        return;
      }
    }
  }

  // default to plain-text. send()
  res.type('txt').send(`Error ${errorcode}: Not found`);
}

//console.log(FindCopy([1,2], 1));

app.get('/ecmaker', (req, res, next) => {
  if (req.accepts('html') == "html") {
    res.render('Esay-Catolge-Maker', {modelData: objData, classes: mmClassParse, modelPath: modelPath})
    return;
  }
});
app.get('/api', (req, res, next) => {

});
app.get('/api/roblox', (req, res, next) => {

});
app.get('/api/roblox/url/', async (req, res, next) => {
  urlPath = req.query.url

  if (urlPath == null) {
    res.redirect(Error/404)
  }

  const UrlSplit = urlPath.toLowerCase().trim().split(/:?\/+/g);
  const UrlBeging = UrlSplit.slice(0, 2);

  if (/(http)s?/.test(UrlBeging[0]) == true && /(roblox.com)/.test(UrlBeging[1])) {
    try {

    } catch (error) {
      res.redirect(Error/500)
    }
    const fetchRespose = await fetch(urlPath)
    const fetchJson = await fetchRespose.json()

    res.send(fetchJson)
  } else {
    res.redirect(Error/404)
  }

}),
/*
app.get('/api/roblox/Url/', async (req, res, next) => {
  //urlPath = req.query.url

  const UrlSplit = urlPath.toLowerCase().trim().split(/:?\/+/g);
  const UrlBeging = UrlSplit.slice(0, 2);

  if (/(http)s?/.test(UrlBeging[0]) == true && /(roblox.com)/.test(UrlBeging[1])) {
    const fetchRespose = await fetch(urlPath)
    const fetchJson = await fetchRespose.json()

    res.send(fetchJson)
  } else {
    res.sendStatus(404);
  }
}),*/
app.get('/code-editor', (req, res, next) => {
  if (req.accepts('html') == "html") {
    res.render('Editor', {})
    return;
  }

  // respond with json
  if (req.accepts('json') == "json") {
    res.redirect("/api");
    return;
  }

  // default to plain-text. send()


  setTimeout(() => { res.redirect("/"); }, 3000);

}),
app.get('/', (req, res, next) => {
  if (req.accepts('html') == "html") {
    res.render('Home', {CodeEditorLink: req.protocol + '://' + req.get('host') + "/code-editor"})

    urlPath = req.protocol + '://' + req.get('host') + "/code-editor"
    UrlSplit = urlPath.trim().split(/:?\/+/g);
    return;

  }

  // respond with json
  if (req.accepts('json') == "json") {
    res.redirect("/api");
    return;
  }

  // default to plain-text. send()
  res.type('txt').send("linkes: " + req.protocol + '://' + req.get('host') + "/code-editor");
}),
/* Status Code Handling */
app.get('/Error/:Errornumber', (req, res) => {
  HandleError(req, res, req.params.Errornumber)
}),
app.all('*', (req, res) => {
  res.status(404);
  HandleError(req, res, 404)
})

app.listen(3000)

/*
const express = require("express");
const app = express();


app.get('/', (req, res) => {
  res.send("lol");
});

app.all('*', (req, res, next) => {

});

app.listen(3000);
*/
