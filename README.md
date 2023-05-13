# Star Wars: Saga Edition - Character Sheet Builder

This is the source code for [SagaWorkshop.net](https://sagaworkshop.net), originally created in Oct. 2017 and open-sourced in May 2023. It uses Firebase as a backend and Vue.js as a frontend.

In order for the site to be "complete", the following tasks need to be done:
- Get the site running again. The code is old, the packages (notably Firebase and Vue) are out of date and it's likely the site may not run if we try to upload the code again in its current state.
- Add talents, feats, etc. from all source books in JSON format. I suspect this wouldn't be too difficult, as there is a .json file floating around on the internet that contains everything. It would need to be converted to the correct format and added to src/data/features.json: https://drive.google.com/drive/u/0/mobile/folders/18KM8N6kcegBgVMhx4pa6BtBaGSbv9HZg?usp=drive_open
- Hook up the requirements data. Saga workshop uses a smart requirements system, making sure that you meet all the prerequisites for a given talent or feat. This would need to be done manually in src/data/features.json.
- Add .png icons for each talent/feat/etc. in the static/features folder with names matching the key values in src/data/features.json.
- Implement dice rolling - a result is supposed to pop up when you click the gear icon next to an ability or stat.
- Optional goal: Implement droid customization. This would be a significant undertaking, I don't think it would be worth it since most GMs don't allow players to be droids anyway.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
