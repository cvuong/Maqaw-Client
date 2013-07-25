#!/bin/sh

#must cat them in a specific order because of dependencies 

cat class-ChatManager.js class-LoginPage.js peer.js maqaw-toolbelt.js class-ChatSession.js class-VisitorSession.js class-MaqawManager.js class-MaqawManager.js class-MaqawDisplay.js class-Representative.js class-RepSession.js class-Visitor.js class-VisitorList.js maqaw.js > minifier_temp.js

cat  maqaw.css > minifier_temp.css

yuicompressor minifier_temp.css > maqaw.min.css
yuicompressor minifier_temp.js > maqaw.min.js 

#remove temp file
rm minifier_temp.*
