D:.
│  .eslintrc.js
│  .gitignore
│  .npmignore   ( 优先级高于gitignore, 用于npm发包忽略文件 )
│  .travis.yml   ( travis的配置文件。Travis CI 用来构建及测试在GitHub托管的代码,[https://segmentfault.com/a/1190000011218410?utm_source=tag-newest] )
│  bower.json   ( 无论你是使用bower来为项目管理外部依赖，还是准备制作一个包，都是通过bower.json文件来进行的，这个文件可以说是bower运行的核心 )
│  CHANGELOG.md
│  CODE_OF_CONDUCT.md
│  COLLABORATOR_GUIDE.md
│  CONTRIBUTING.md
│  COOKBOOK.md
│  ECOSYSTEM.md
│  Gruntfile.js
│  index.d.ts
│  index.js
│  karma.conf.js   (karma 是运行在node上的自动化测试工具)
│  LICENSE
│  package.json
│  README.md
│  UPGRADE_GUIDE.md
│  webpack.config.js
│  
├─.github
│  │  ISSUE_TEMPLATE.md
│  │  PULL_REQUEST_TEMPLATE.md
│  │  
│  └─ISSUE_TEMPLATE
│          ---bug-report.md
│          ---documentation.md
│          ---support-or-usage-question.md
│          --feature-request.md
│          
├─dist   ( 打包后的成品代码 )
│      axios.js
│      axios.map
│      axios.min.js
│      axios.min.map
│      
├─examples   ( 示例代码 )
│  │  README.md
│  │  server.js
│  │  
│  ├─all
│  │      index.html
│  │      
│  ├─amd
│  │      index.html
│  │      
│  ├─get
│  │      index.html
│  │      server.js
│  │      
│  ├─post
│  │      index.html
│  │      server.js
│  │      
│  ├─transform-response
│  │      index.html
│  │      
│  └─upload
│          index.html
│          server.js
│          
├─lib   ( 项目源码 )
│  │  axios.js
│  │  defaults.js
│  │  utils.js
│  │  
│  ├─adapters
│  │      http.js
│  │      README.md
│  │      xhr.js
│  │      
│  ├─cancel
│  │      Cancel.js
│  │      CancelToken.js
│  │      isCancel.js
│  │      
│  ├─core
│  │      Axios.js
│  │      createError.js
│  │      dispatchRequest.js
│  │      enhanceError.js
│  │      InterceptorManager.js
│  │      mergeConfig.js
│  │      README.md
│  │      settle.js
│  │      transformData.js
│  │      
│  └─helpers
│          bind.js
│          buildURL.js
│          combineURLs.js
│          cookies.js
│          deprecatedMethod.js
│          isAbsoluteURL.js
│          isURLSameOrigin.js
│          normalizeHeaderName.js
│          parseHeaders.js
│          README.md
│          spread.js
│          
├─sandbox
│      client.html
│      client.js
│      server.js
│      
└─test
    ├─manual
    │      basic.html
    │      cors.html
    │      fixture.json
    │      promise.js
    │      
    ├─specs
    │  │  adapter.spec.js
    │  │  api.spec.js
    │  │  basicAuth.spec.js
    │  │  cancel.spec.js
    │  │  defaults.spec.js
    │  │  headers.spec.js
    │  │  instance.spec.js
    │  │  interceptors.spec.js
    │  │  options.spec.js
    │  │  progress.spec.js
    │  │  promise.spec.js
    │  │  requests.spec.js
    │  │  transform.spec.js
    │  │  xsrf.spec.js
    │  │  __helpers.js
    │  │  
    │  ├─cancel
    │  │      Cancel.spec.js
    │  │      CancelToken.spec.js
    │  │      isCancel.spec.js
    │  │      
    │  ├─core
    │  │      createError.spec.js
    │  │      enhanceError.spec.js
    │  │      mergeConfig.spec.js
    │  │      settle.spec.js
    │  │      transformData.spec.js
    │  │      
    │  ├─helpers
    │  │      bind.spec.js
    │  │      buildURL.spec.js
    │  │      combineURLs.spec.js
    │  │      cookies.spec.js
    │  │      isAbsoluteURL.spec.js
    │  │      isURLSameOrigin.spec.js
    │  │      normalizeHeaderName.spec.js
    │  │      parseHeaders.spec.js
    │  │      spread.spec.js
    │  │      
    │  └─utils
    │          deepMerge.spec.js
    │          extend.spec.js
    │          forEach.spec.js
    │          isX.spec.js
    │          merge.spec.js
    │          trim.spec.js
    │          
    ├─typescript
    │      axios.ts
    │      
    └─unit
        └─adapters
                http.js
                
