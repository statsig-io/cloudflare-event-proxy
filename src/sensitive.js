/**
 * Proof of concept! 
 * Do not rely on these rudimentary checks in production
 */
const regexChecks = {
  'credit_card': {
    exp: '^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$',
    prep: val => val.replace(/[^\d]/gi, '')
  },
  'social_security': {
    exp: "^(?!666|000|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}$"
  },
  'phone_number': {
    exp: '^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$'
  }
}

/**
 * Takes any value and tests all of the
 * regex checks against it to see if it has sensitive data
 * returns name of failed check or false if clean
 */
const hasSensitiveData = (value) => {
  for (const [name, rule] of Object.entries(regexChecks)) {
    const regex = new RegExp(rule.exp),
      // some of the regex checks require the original value to be cleansed of special characters
      preppedVal = typeof rule.prep === 'function' ? rule.prep(String(value)) : value;
    if (regex.test(preppedVal)) return name;
  }
  return false;
}


module.exports = hasSensitiveData;