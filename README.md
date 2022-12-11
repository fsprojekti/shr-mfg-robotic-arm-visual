# warehouse
# warehouse

1. spremeniti IP nalsov v config.json !!!
2. zaustavljati delovanje server v robot --> v terminal : "pm2 stop 0"  !!!
3. zaženi index.js pod mapa shr-mfg-robotic-arm-http-server --> node index.js  !!!
4. z vnosom v brskalnik: localhost:3000
5. start gumb za avtomatsko delovanje, stop gumb za ustavljanje avtomatsko delovanje, ostale gumba so za testiranje kode oz. ročno upravljanje

shema:
![image](public/image/schema.png)


## HTTP API :

|API|parameter|return|
|---|---|---
|`/dispatch`|mode(obvezna),OfferId(obvezna),locattion(obvezna za relocation)| /
|`/dock`|location,level |JSON object:podatke o shranjene paket
|`/task`|/|JSON object: vse naloga v čakalna vrsta
|`/offer`|/|JSON object: vse podatke shranjeni offer


### `/dock`               
* če ni parameter, vrne podatke o vse shranjene paket v json.file
* če je samo location nastavljena(1-4), potem prikaži podatke o shranjevanje paket tistem lokacija.
* če je oba parameter nastavljena, prikaži določeni lokacija in določeni stolpec
                                        
### `/task` 
* JSON object : vse naloga v čakalna vrsta
### `/offer` 
* JSON object : Offer{id, location, package ID[]}

### `/dispatch`       
|mode|OfferId|location|
|---|---|---
|"unload", "load", "relocation"|`__NUMBER__`|`_1-4_`

#### load (robot shrani paket iz transport v skladišče)
* če je parameter pravilno nastavljen, naloga se vstavi v čakalni vrsto.
* naloga se izvaja po vrstni redu po čakalni vrsto.
* robot približa mesto, ki odloži paket oz. mesto, ki čaka transportni robot.
* robot izračuna kordinat center paket (robot se zaznava samo krožni površina, ni sem uporabil April tag)
* robot premakne na mesto tako, da bo center kamera po z os kolinealna center paket.
* robot izračuna koliko paket je pod kamera
* robot skenira apritag ID
* robot naredi offset od kamera do središče orodja(pnevmatski sesalec).
* robot pobira paket in ga shrani v receive buffer
* * robot postopek ponavlja za vse paket
* robot pobira paket iz receive buffer in ga premakne na dock.
* lokacija shranjevanje se izbre na mesto, ki ima najmanj shranjen paket.
* * postopek ponavlja za vse paket v receive buffer
* podatke ID offer, lokacija shranjevanje in vse ID paket v tem offer se shrani v json file v offer.json
* podatke dock.json je shranjena ID paket v posamezni lokacija dock. 
* robot vrne na izhodiščni lega.
* primer: `http://localhost:3000/dispatch?OfferId=1&mode=load`

#### unload (robot oddaja paket iz skladišče v transport)
* če je parameter pravilno nastavljen, program preveri kje je shranjen vnešeni offer
* če nikjer ne najde, vrne napka
* če je najdu, vstavi naloga v čakalni vrsto
* če je na vrst naloga, robot približa na mesto,kjer shranjeni paket.
* če je zadnja paket iz želenega offer leži na najviši stopnja, ga vzame in premakne v območje, ki odloži paket oz. transportni robot, ki čaka za sprejet paket
* če leži pod drugim paket, vse paket, ki je nad želeni paketi, ga žačasno premaknemo.
* nato želeni paket premakne za odlož.
* začasno premaknjeni paket nazaj shranimo v mesto, ki je bil prej shranjen.
* po končanje naloga se izbriše tistega offer iz json datoteka.
* robot vrne na izhodiščni lega.
* primer: `http://localhost:3000/dispatch?OfferId=1&mode=unload`

#### relocation
* od razlika od drugi način delovanje je obvezno nastaviti "location", kot novo mesto shranjevanje.
* delovanje je podobna pri "unload"
* Robot premakne vse paket iz želenega offer na novi lokacija.
* primer: `http://localhost:3000/dispatch?OfferId=1&mode=relocation&location=2`

