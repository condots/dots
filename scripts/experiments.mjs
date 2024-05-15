import moment from "moment";

// const date = new Date(value);
// console.log(date);

// function isValidISO8601(value) {
//   // Regular expression to match ISO 8601 date formats
//   const iso8601Regex =
//     /^(\d{4}-[01]\d-[0-3]\d([Tt][0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([Zz]|[+-][0-2]\d:[0-5]\d)?)?)$/;

//   const iso8601WithTimezoneRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

//   return iso8601Regex.test(value);
// }

// console.log(isValidISO8601(value));

// /^\d{4}-[01]\d-[0-3]\d([Tt][0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([Zz]|[+-][0-2]\d:[0-5]\d)?)?)$/;
// /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const timezone = "2024-03-06T00:00:00+01:00";
const offset = "2024-03-06T00:00:00+01:00";
let t;

t = moment(timezone, "YYYY-MM-DDTHH:mm:ssZ", true);
// t = moment(timezone, moment.ISO_8601, true);
console.log(t.isValid());

// t = moment(offset, "YYYY-MM-DDTHH:mm:ssZ", true);
// console.log(t.isValid());
