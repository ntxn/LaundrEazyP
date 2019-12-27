const WASHER = 1;
const DRYER = 2;

// Machine status
const WORKING = 0;
const REPORTED_BROKEN = 1;
const INVESTIGATING = 2;
const FIXING = 3;

const status = ["Working", "Reported Broken", "Investigating", "Fixing"];

const MAX_MACHINES_NUM = 15;


export {
  WASHER,
  DRYER,
  MAX_MACHINES_NUM,
  WORKING,
  REPORTED_BROKEN,
  INVESTIGATING,
  FIXING,
  status,
}