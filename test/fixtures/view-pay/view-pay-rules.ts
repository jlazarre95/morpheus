// import { plainToInstance } from "class-transformer";
// import { BlueprintCorrelation, BlueprintParameter } from "../../../src/blueprints/models";

// export namespace ViewPayRules {

//     export const PARAMETERS: BlueprintParameter[] = plainToInstance(BlueprintParameter, [
//         {
//             name: "P_UltiProHost",
//             replace: "d13up08wb01.dev.us.corp",
//         },
//         {
//             name: "P_UltiProHost",
//             replace: "d13up08wb01.dev.us.corp"
//         },
//         {
//             name: "P_Username",
//             replace: "broadL"
//         },
//         {
//             name: "P_Password",
//             replace: "password"
//         }
//     ]);

//     export const CORRELATIONS: BlueprintCorrelation[] = plainToInstance(BlueprintCorrelation, [
//         {
//             name: "C_ViewState",
//             scope: BlueprintCorrelationScope.all,
//             boundary: {
//                 left: { boundary: `_VIEWSTATE" value="` },
//                 right: { boundary: `" />` }
//             }
//         },
//         {
//             name: "C_ViewStateGen",
//             scope: BlueprintCorrelationScope.all,
//             boundary: {
//                 left: { boundary: `_VIEWSTATEGENERATOR" value="` },
//                 right: { boundary: `" />` }
//             }
//         },
//         {
//             name: "C_EventValidation",
//             scope: BlueprintCorrelationScope.all,
//             boundary: {
//                 left: { boundary: `_EVENTVALIDATION" value="` },
//                 right: { boundary: `" />` }
//             }
//         },
//     ]);

// }