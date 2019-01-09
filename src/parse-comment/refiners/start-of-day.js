// module.exports = {
//   refine (text, results, opt) {
//     if (opt.startOfDay) {
//       results.forEach(result => {
//         if (!result.start.isCertain('hour')) {
//           result.start.imply('hour', opt.startOfDay)
//           result.tags['StartOfWorkDayRefiner'] = true
//         }
//       })
//     }
//
//     return results
//   }
// }
