# Changelog

## [2.0.0-alpha.3](https://github.com/developmentseed/stac-react/compare/v1.0.0-alpha.3...v2.0.0-alpha.3) (2026-06-08)


### ⚠ BREAKING CHANGES

* use stac-ts for types ([#54](https://github.com/developmentseed/stac-react/issues/54))
* reload() method renamed to refetch() in useCollection, useCollections, and useItem hooks.
* Hooks no longer return `state` property. Use `isLoading` and `isFetching` booleans instead.
* Remove collections, setCollections, getItem, addItem, deleteItem from context. Context now only provides stacApi. Users should use useCollections() hook directly instead of accessing collections from context.

### Features

* Add basic pagination implementation ([d8c44c4](https://github.com/developmentseed/stac-react/commit/d8c44c4b0e8c837c9f65f7d5a539fb08be8f9962))
* Add collections filter to search hook ([23b9d08](https://github.com/developmentseed/stac-react/commit/23b9d08d390d4e210bedc8dad1467c4fdae6c18f))
* Add date-range filter to useStacSearch ([9cc0e90](https://github.com/developmentseed/stac-react/commit/9cc0e90c70d9155c76d936f5d73c440fae833630))
* Add error handling for useCollection ([025023b](https://github.com/developmentseed/stac-react/commit/025023bbf945db69ff65796a5eccbbddce950af6))
* Add error handling for useItem ([e57e3a0](https://github.com/developmentseed/stac-react/commit/e57e3a0be3a1be1196a5408f76d5f50ccb093b7a))
* Add error handling to useCollections ([0c6cfdb](https://github.com/developmentseed/stac-react/commit/0c6cfdb64df2113886ac19220030fde57cb87178))
* Add GET search ([f328944](https://github.com/developmentseed/stac-react/commit/f328944da29acd179ee0a445f8498e22284c12e1))
* Add ID filter (resolves [#21](https://github.com/developmentseed/stac-react/issues/21)) ([bf297e3](https://github.com/developmentseed/stac-react/commit/bf297e3f2767f36b47a95d10685838b661456178))
* Add limit to set page size in search (resolves [#22](https://github.com/developmentseed/stac-react/issues/22)) ([c48d752](https://github.com/developmentseed/stac-react/commit/c48d752dd1aab034c08c923a9f35c4f73479cf85))
* Add loading state ([594f32c](https://github.com/developmentseed/stac-react/commit/594f32cd609924845436fb28c320057e2ceaeb4d)), closes [#8](https://github.com/developmentseed/stac-react/issues/8)
* Add reload item ([f1bc57a](https://github.com/developmentseed/stac-react/commit/f1bc57a99379d75854c03791ac608bdd3cecadc2))
* Add reload to useCollection ([5db4b2b](https://github.com/developmentseed/stac-react/commit/5db4b2b24965318873bf950709c83ede15567989))
* Add sortby field (resolve [#23](https://github.com/developmentseed/stac-react/issues/23)) ([69227eb](https://github.com/developmentseed/stac-react/commit/69227ebd75abb7616cd1a8adbe95e712454f7ce4))
* Add useCollection hook ([9684545](https://github.com/developmentseed/stac-react/commit/9684545b90b4cda14493c2abac9c6e91c19397f3))
* Add useCollections hook ([cf60bf6](https://github.com/developmentseed/stac-react/commit/cf60bf6fd73c40d28e9f3ffd136e0503cb2b5073))
* Add useItem hook ([fefcd86](https://github.com/developmentseed/stac-react/commit/fefcd86abe7be9e6a372ac372428a46823c95123))
* Add useStacApi hook ([0b6a69a](https://github.com/developmentseed/stac-react/commit/0b6a69a35c54e622ec3f457388932cfa9ced7519))
* enable TanStack Query DevTools browser extension ([e40fcce](https://github.com/developmentseed/stac-react/commit/e40fccecdef9c757c199acdee53d28b1ca1379a9))
* Handle errors ([32f212b](https://github.com/developmentseed/stac-react/commit/32f212baf39eb68e0d2322feba7f8ad01adc5e48)), closes [#6](https://github.com/developmentseed/stac-react/issues/6)
* Include pagination headers in search ([787be1e](https://github.com/developmentseed/stac-react/commit/787be1e4b62b17251a98efb678301a25c9bca9e6))
* Merge search payload with pagintion link body ([93ac27f](https://github.com/developmentseed/stac-react/commit/93ac27f9651c05a8ae7d04194cd7d376fff1c9ee))
* migrate useCollections hook to TanStack Query ([9bccaaa](https://github.com/developmentseed/stac-react/commit/9bccaaa27e693f96acc5bdb480d32a7f8b2b563c))
* migrate useItem hook to TanStack Query ([a04443b](https://github.com/developmentseed/stac-react/commit/a04443b6ce04970e7772f07c54414fda8c0a7e6b))
* migrate useStacApi hook to TanStack Query ([9999717](https://github.com/developmentseed/stac-react/commit/99997177486c137ee6e163569b8b2afa64d12afd))
* migrate useStacSearch hook to TanStack Query ([4d0f701](https://github.com/developmentseed/stac-react/commit/4d0f7019977951bc7574e911bd151bf7084007c9))
* optimize React Query cache keys ([9f30e60](https://github.com/developmentseed/stac-react/commit/9f30e60756214c9b84f580237b3aaaa6e705a2fe))
* Pass STAC-API options to context ([b2cf2d8](https://github.com/developmentseed/stac-react/commit/b2cf2d8953838914da81c292291921f4138c0c24))
* Refactor, use context API ([99d326e](https://github.com/developmentseed/stac-react/commit/99d326e6b6cc5089b10627638c22dd5e8bb484a3))
* Specify Stac API request headers ([575da0f](https://github.com/developmentseed/stac-react/commit/575da0f15178791ba13bb9a8d1817fc740e039ea))


### Bug Fixes

* add comprehensive error handling for JSON parsing failures ([ec62ab4](https://github.com/developmentseed/stac-react/commit/ec62ab4251181591f3dfd8d3efdc2df301df8f58))
* Export useCollection and useItem ([4b5e39c](https://github.com/developmentseed/stac-react/commit/4b5e39ce48132851e0c44ba4634a34732f4d9225))
* externalize @tanstack/react-query in build and fix StacApiProvider initialization order ([e0819c4](https://github.com/developmentseed/stac-react/commit/e0819c43f24b92ebb60755fc8b8402e072bb9437))
* generate index.d.ts at dist root for proper TypeScript imports ([1dfbf58](https://github.com/developmentseed/stac-react/commit/1dfbf58f05ae6c0f466aa1f4fd4df3c1ec122a16))
* ID prev link via rel=previous ([a6495d6](https://github.com/developmentseed/stac-react/commit/a6495d6623b0fbd0403fa262fe06945c91b2a034))
* make date range parameters optional in useStacSearch hook ([6b75fcc](https://github.com/developmentseed/stac-react/commit/6b75fcc1c72f5ddfd9ca77b46347190556433716))
* make DevTools opt-in to avoid conflicts with consuming apps ([6f5713d](https://github.com/developmentseed/stac-react/commit/6f5713d4546643612d1fc90214cef6c4ba9b3b96))
* prevent memory leak in debounced submit function ([9cb92fa](https://github.com/developmentseed/stac-react/commit/9cb92fa90c9ece4ee1564f25bcb61e069ac3d311))
* prevent refetch of STAC API when options change ([#57](https://github.com/developmentseed/stac-react/issues/57)) ([c6dcb83](https://github.com/developmentseed/stac-react/commit/c6dcb8337436925a24f802b3df5d1878871da802))
* properly type reload as async across all hooks ([0109e59](https://github.com/developmentseed/stac-react/commit/0109e59b8dd11245628cbca8d446d997ae16018c))
* Remove collection reload when initialising useCollections ([505b426](https://github.com/developmentseed/stac-react/commit/505b426c39ed8d8d5f787a95cc47336f2c0fff65))
* Remove dependency on collections object in useCollections effect hook ([a914f22](https://github.com/developmentseed/stac-react/commit/a914f22b58234a48f78416a13058c95df2b0a34f))
* Remove trailing `/` from stac baseUrl [fix [#15](https://github.com/developmentseed/stac-react/issues/15)] ([05e752c](https://github.com/developmentseed/stac-react/commit/05e752ccf25e5b8fe56fb38339a4f295799760ab))
* Reset state with each new StacAPI instance [fix: [#17](https://github.com/developmentseed/stac-react/issues/17)] ([89fdaa7](https://github.com/developmentseed/stac-react/commit/89fdaa71376a9390839df6271fece8420b1509a1))
* Send selection collections as undefined is array is empty [fix [#16](https://github.com/developmentseed/stac-react/issues/16)] ([b763302](https://github.com/developmentseed/stac-react/commit/b763302a3daa0404232d47938ee6fbeadbdad522))
* Sort bbox coordinates before POSTing ([6eab46a](https://github.com/developmentseed/stac-react/commit/6eab46a868dc601c443f8ccc119e4123b08b13e4))
* Update module names in package.json ([1ba363c](https://github.com/developmentseed/stac-react/commit/1ba363c703ff9bad83048410b3f3947ab56d0e75))


### Code Refactoring

* add base StacHook interface for type consistency ([6849141](https://github.com/developmentseed/stac-react/commit/68491419c9d4265c619de5f6ca531e841893fce1))
* Clean up types ([e519ce3](https://github.com/developmentseed/stac-react/commit/e519ce3a2435ce7cc4718b6abb90c5fb7f163838))
* fetch single collection directly from /collections/{id} endpoint ([c785dea](https://github.com/developmentseed/stac-react/commit/c785dea250b5d9c1b1320ba3d5a6e452174886d5))
* Internal handling and execution of pagination ([8ce2251](https://github.com/developmentseed/stac-react/commit/8ce2251a401380ca491abaaac73a08cae0dc32a4))
* Make request options for fetch function optional ([56a4b8e](https://github.com/developmentseed/stac-react/commit/56a4b8e522e0f2905e0c01b79574a9dc2095da7e))
* remove collections/items state from context ([fd431a3](https://github.com/developmentseed/stac-react/commit/fd431a309b52ec390a894d4f90c88103ec7dab16))
* rename reload to refetch in hooks API ([44882cb](https://github.com/developmentseed/stac-react/commit/44882cb4de29c6c0f759087732a8d078804062ab))
* replace LoadingState with React Query's isLoading/isFetching ([3236166](https://github.com/developmentseed/stac-react/commit/32361668555d477ff4ec5ab75de6841a535fafb3))
* replace Object.assign error pattern with ApiError class ([0b4bcdc](https://github.com/developmentseed/stac-react/commit/0b4bcdc84aa27f93434e388b8ff89baef79ffb3c))
* replace queryClient prop with auto-detecting parent QueryClient ([3ddb6f2](https://github.com/developmentseed/stac-react/commit/3ddb6f2cec24ca0401fa34d4b01d9e6ba74d6502))
* use stac-ts for types ([#54](https://github.com/developmentseed/stac-react/issues/54)) ([d07fe44](https://github.com/developmentseed/stac-react/commit/d07fe44de03bc122fb3b6efcf4a1c2cf8d7de6fe))
