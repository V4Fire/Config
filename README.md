# @v4fire/config

Простой [config](https://www.npmjs.com/package/config)-like конфигуратор с поддержкой параметров командной строки, переменных среды и вычисляемых опций, преобразования значений и их валидации.

## Установка

### npm

```bash
npm install @v4fire/config --save
```

### yarn

```bash
yarn add @v4fire/config
```

## Базовое использование

- Создайте папку config в корне своего проекта
- Внутри этой папки создайте default.js, development.js и production.js
- Каждый из этих файлов должен экспортировать объект – @v4fire/config берет за основу `default.js`, и подмешивает к нему `development.js` или `production.js` -- в зависимости от NODE_ENV.
 
## Расширенные опции

@v4fire/config предоставляет простой интерфейс для использования переменных среды, параметров командной строки и создания вычисляемых в рантайме свойств, а также их преобразования и валидации.

### Options

Большинство расширенных возможностей предоставляет функция `option` из `@v4fire/config/options`.
@v4fire/config
Для примера возьмем случай, когда нам нужно запускать приложения на разных портах (на локальной машине на одном, на бою -- на другом):

`config/default.js`
```js
const {option: o} = require('@v4fire/config/options');

module.exports = {
  port: o('port', {
    default: 8080, // значение по умолчанию
    
    short: 'p', // короткий алиас '-p' для командной строки
    
    env: 'PORT_TO_LISTEN', // Теперь значение этой опции можно менять через переменную окружения PORT_TO_LISTEN 
    
    coerce(value) {
      return Number(value); // приводим к числу
    },
    
    validate(value) {
      return value > 0 && value < 65536; // валидируем значение
    }
  })
}
```

`app.js`
```js
const config = require('@v4fire/config');

console.log(`Application listen port ${config.port}`);
```

Теперь приложение можно запускать на разных портах:

```bash
$ node app --port 1717
Application listen port 1717

$ node app -p 2020
Application listen port 2020

$ export PORT=3030
$ node app
Application listen port 3030
```

### Сomputed options

Если вам нужны в конфиге значения, которые нужно считать в рантайме (которые, скажем, зависят от других значений) -- для этого нужно использовать `computedOption` из `@v4fire/config/options`.

Пример:

`config/default.js`

```js
const {option: o, computed: co} = require('@v4fire/config/options');

module.exports = {
  build: { // конфиг для сборки проекта

    // допустим, проект нужно собирать по-разному
    // для разных платформ
    platform: o('platform', {
      default: 'linux',
      valuesFlags: ['linux', 'windows', 'osx'], // чтобы запускать сборку сразу с флагом --windows, например
      validate: ['linux', 'windows', 'osx'] // в качестве валидатора можно передать список возможных значений
    }),
    
    // какая-нибудь фича, которая должна быть 
    // только в сборке для windows
    includeWindowsOnlyFeature: co((config) => config.build.platform === 'windows')
  }
}
```

`build.js`

```js
const buildConfig = require('@v4fire/config').build;

console.log(`Platform: ${buildConfig.platform}`);
console.log(
	`Windows only feature`,
	buildConfig.includeWindowsOnlyFeature ? 'included' : 'not included'
)
```

Сборка:

```bash
$ node build
Platform: linux
Windows only feature not included

$ node build --platform osx
Platform: osx
Windows only feature not included

$ node build --windows
Platform: windows
Windows only feature included
```

## API

### @v4fire/config/options

**option(name: string, params?: Object)**

Универсальная функция для получения значения из параметров консольной строки или переменных окружения, их преобразования и валидации.

- _name_: `string` – имя опции, обязательный параметр

- _params_: `Object` – параметры:

  - _default_: `any` – значение по умолчанию.

  - _argv_: `boolean | string` – значение `false` отключает получение значени≤я из параметров командной строки. Строковое значение переопределяет имя параметра командной строки (по умолчанию берется name).
  
  - _env_: `boolean | string` - строковое значение переопределяет имя переменной окружения, из которой надо брать значение (по умолчанию берется `name`, приведенное к верхнему регистру и с `-` замененными на `_`, т.е., если имя равно `api-url`, то значение будет браться из переменной окружения `API_URL`). Значение `false` отключает получение значения из переменных окружения. 

  - _short_: `string` - однобуквенный алиас для командной строки

  - _type_: `'boolean' | 'number' | 'json'` – тип опции. Ставит значения для `coerce` и `validate`.

  - _valuesFlags_: `Array<string> | Object` – объявляет флаги командной строки, которые устанавливают для опции конкретное значение. Пример:
   
    ```js
    option('watcher', {
      default: false,
      type: 'boolean',
      valuesFlags: {
        watch: true
      }
    }); // при запуске приложения с флагом '--watch' вернет true
    ```

  - _coerce_: `(value: string, source: string) => any` – функция для преобразования значения (скажем, для перевода его из строки в число). Получает два параметра: `value` – значение и `source` – источник значения (`null`, если значение получено не было и дефолтное значение не задано, `'default'`, если установлено дефолтное значение, `'cli'`, если значение получено из параметров командной строки и `'env'`, если значение получено из переменных окружения)
  
  - _validate_: `(value: string, source: string) => boolean` – функция для валидации данных. Получает те же параметры, что и `coerce`.
  
Приоритет источников от меньшего к большему: 
  - Значение по умолчанию
  - Значение из переменной окружения
  - Значение из командной строки
  - Значение из командной строки для короткого алиаса (`short`)
  - Значение из командной строки для флагов значений (`valuesFlags`)

**computedOption(handler: Function)**

Вычисление значения в рантайме (например, на основании других параметров конфига). Принимает один параметр – функцию:

  - _handler_: `(config) => any` – функция, которая принимает первым аргументом весь конфиг и возвращает значение.

**Важно**: эту функцию можно использовать только внутри объекта с конфигом. Так же важно не допускать появления кольцевых зависимостей – т.е. когда две опции зависят от значений друг друга – это приведет к переполнению стека и ошибке. Однако, одна вычисляемая опция может использовать значение другой вычисляемой опции.

### @v4fire/config

Для получения конфига достаточно импортировать модуль:

```js
const config = require('@v4fire/config');
```

## Лицензия

[MIT](https://github.com/V4Fire/Config/blob/master/LICENSE)
