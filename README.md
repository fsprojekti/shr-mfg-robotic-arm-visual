# warehouse

1. spremeniti IP nalsov v config.json !!!
2. zaustavljati delovanje server v robot --> v terminal : "pm2 stop 0"  !!!
3. zaženi index.js pod mapa shr-mfg-robotic-arm-http-server --> node index.js  !!!
4. z vnosom v brskalnik: localhost:3000
5. start gumb za avtomatsko delovanje, stop gumb za ustavljanje avtomatsko delovanje, ostale gumba so za testiranje kode oz. ročno upravljanje

shema:
[][code-past]:/public/image/shema.jpg


## HTTP API :

|API|parameter|return|
|---|---|---
|`/dispatch`|mode(obvezna),OfferId(obvezna),locattion(obvezna za relocation)| /
|`/dock`|location,level |JSON object:podatke o shranjene paket
|`/task`|/|JSON object: vse naloga v čakalna vrsta

### `/dock`               
* če ni parameter, vrne podatke o vse shranjene paket v json.file
* če je samo location nastavljena(1-4), potem prikaži podatke o shranjevanje paket tistem lokacija.
* če je oba parameter nastavljena, prikaži določeni lokacija in določeni stolpec
                                        
### `/task` 
* JSON object : vse naloga v čakalna vrsta

### `/dispatch`       
|mode|OfferId|location|
|---|---|---
|"unload", "load", "relocation"|`__NUMBER__`|`_1-4_`

#### load
* če je parameter pravilno nastavljen, naloga se vstavi v čakalni vrsto.
* naloga se izvaja po vrstni redu po čakalni vrsto.
* robot približa mesto, ki odloži paket oz. mesto, ki čaka transportni robot.
* robot izračuna kordinat center paket (robot se zaznava samo krožni površina, ni sem uporabil April tag)
* robot premakne na mesto tako, da bo center kamera po z os kolinealna center paket.
* robot naredi offset od kamera do središče orodja(pnevmatski sesalec).
* robot pobira paket in ga shrani v skladišče
* lokacija shranjevanje se izbre na mesto, ki ima najmanj shranjen paket.
* robot vrne na izhodiščni lega.

### unload
* če je parameter pravilno nastavljen, program preveri kje je shranjen vnešeni paket
* če nikjer ne najde, vrne napka
* če je najdu, vstavi naloga v čakalni vrsto
* če je na vrst naloga, robot približa na mesto shranjeni paket.
* če leži na najviši stopnja, ga vzame in premakne v območje, ki odloži paket oz. transportni robot, ki čaka za sprejet paket
* če leži pod drugim paket, vse paket, ki je nad želeni paket, ga žačasno premaknemo.
* nato želeni paket premakne za odlož.
* začasno premaknjeni paket nazaj shranimo v mesto, ki je bil prej shranjen.

### relocation
* od razlika od drugi način delovanje je obvezno nastaviti "location", kot novo mesto shranjevanje.
* delovanje je podobna pri "unload"

### opomba
* v datoteka src/visual je funkcija `download_image` in `snapshot`
* oba funcija vreže enako rezultat.
* `download_image` je več hitrejši kot `snapshot`, vendar zaradi neznani problem je nehal delovati(nič ni sem spremenil pa je enkrat nehal delovati)

