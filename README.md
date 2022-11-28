# warehouse

1. spremeniti IP nalsov v config.json !!!
2. zaustavljati delovanje server v robot --> v terminal : "pm2 stop 0"  !!!
3. zaženi index.js pod mapa shr-mfg-robotic-arm-http-server --> node index.js  !!!
4. z vnosom v brskalnik: localhost:3000
5. start gumb za avtomatsko delovanje, stop gumb za ustavljanje avtomatsko delovanje, ostale gumba so za testiranje kode oz. ročno upravljanje

## HTTP API :

|API|parameter|return|
|:--- |:---:---| 
|作者|果冻虾仁|
|---|---
|知乎|[![zhihu-shield]][zhihu]
|公众号|编程往事
 
 
/dock           location,level                   če ni parameter, vrne podatke o vse shranjene paket v json.file
                                                 če je samo locationsom nastavljena(1-4), potem prikaži podatke o shranjevanje paket tistem lokacija.
                                                 če je oba parameter nastavljena, prikaži določeni lokacija in določeni stolpec
                                        
/task                 /                          čakalna vrsta naloga v oblika json.file

/dispatch        mode,OfferId,location                                 /
                 mode(obvezna) --> "load"         
                               --> "unload"     
                               --> "relocation"
                 OfferId(obvezna)
                 location(potrebna samo za relocation, 1-4)
               //load --> pridobi paket iz transport v skladišče
               //unload --> pošlje paket iz skladišče v transport
               //relocation --> premakne paket iz ene mesto shranjevanje v drug mesto shranjevanje (skladišče[1] -> skladišče[2]
