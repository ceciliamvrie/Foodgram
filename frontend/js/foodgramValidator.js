import {
  addFoodText,
  changePasswordText,
  updateRestaurantText,
  loginText,
  registerText } from './alertsConfig';
import validator from 'validator';

class FoodgramValidator {
  isHashTag(string) {
    if (new RegExp(/^(#[a-zA-Z0-9]+)(\s#[a-zA-Z0-9]+)*$/).test(string)) {
      return true;
    }
    return false;
  }

  isPhoto(string) {
    if (new RegExp(/^data:image.(jpeg|jpg|png);base64/).test(string)) {
      return true;
    }
    return false;
  }

  checkPhotoSize(base64) {
    if (Buffer.byteLength(base64, 'utf8') < 2097152) {
      return true;
    }
    return false;
  }

  addFood(state, addAlert) {
    const {image, description, hashTags} = state;
    return new Promise(
      (resolve, reject) => {
        if (image === null) {
          addAlert(addFoodText.photo.invalid, 'danger');
        } else {
          if (this.isHashTag(hashTags)) {
            if (!validator.isLength(description, {min: 2, max: 250})) {
              addAlert(addFoodText.description.length, 'danger');
            } else if (!validator.isLength(hashTags, {min: 2, max: 250})) {
              addAlert(addFoodText.hashtags.length, 'danger');
            } else if (!validator.isAscii(hashTags)) {
              addAlert(addFoodText.hashtags.ascii, 'danger');
            } else if (!validator.isAscii(description)) {
              addAlert(addFoodText.description.ascii, 'danger');
            } else {
              resolve(true);
            }
          } else {
            addAlert(addFoodText.hashtags.invalid, 'danger');
          }
        }
        reject(false);
      }
    );
  }

  editPassword(state, addAlert) {
    const {oldPassword, newPassword, newPassword2} = state;
    return new Promise(
      (resolve, reject) => {
        if (validator.isEmpty(oldPassword) ||
        validator.isEmpty(newPassword) ||
        validator.isEmpty(newPassword2)) {
          addAlert(changePasswordText.empty, 'danger');
        } else if (!validator.isLength(newPassword, {min: 5, max: undefined})) {
          addAlert(changePasswordText.short, 'danger');
        } else {
          !validator.equals(newPassword, newPassword2) ?
          addAlert(changePasswordText.different, 'danger') :
          resolve(true);
        }
        reject(false);
      });
  }

  uploadImage(img, addAlert, msg) {
    return new Promise(
      (resolve, reject) => {
        if (!this.isPhoto(img)) {
          addAlert(msg.extension, 'danger');
        } else {
          if (this.checkPhotoSize(img)) {
            addAlert(msg.loaded, 'success');
            resolve(true);
          } else {
            addAlert(msg.large, 'danger');
          }
        }
        reject(false);
      }
    );
  }

  editProfile(state, addAlert) {
    const {restName, address, description, avatar} = state;
    function checkText(value, prop, len) {
      if (value !== null) {
        if (!validator.isAscii(value)) {
          addAlert(updateRestaurantText.ascii, 'danger');
        } else if (!validator.isLength(value, {min: 5, max: len})) {
          addAlert(updateRestaurantText[prop].length, 'danger');
        } else {
          return true;
        }
        reject(false);
      }
      return true;
    }
    function checkPhoto(value, self) {
      if (value !== null) {
        if (!self.isPhoto(value)) {
          addAlert(updateRestaurantText.avatar.extension, 'danger');
        } else
        if (!self.checkPhotoSize(value)) {
          addAlert(updateRestaurantText.avatar.size, 'danger');
        } else {
          return true;
        }
        reject(false);
      }
      return true;
    }
    return new Promise(
      (resolve, reject) => {
        if (checkText(restName, 'rest_name', 25) &&
            checkText(description, 'description', 200) &&
            checkText(address, 'address', 100) &&
            checkPhoto(avatar, this)) {
          resolve(true);
        }
        reject(false);
      }
    );
  }

  login(login, password, addAlert) {
    return new Promise(
      (resolve, reject) => {
        if (!validator.isAlphanumeric(login)) {
          addAlert(loginText.login.ascii, 'danger');
        } else if (!validator.isAlphanumeric(password)) {
          addAlert(loginText.password.ascii, 'danger');
        } else if (validator.isEmpty(login)) {
          addAlert(loginText.login.enter, 'danger');
        } else if (validator.isEmpty(password)) {
          addAlert(loginText.password.enter, 'danger');
        } else {
          resolve(true);
        }
        reject(false);
      }
    );
  }

  register(username, login, password, passwordTwo, addAlert) {
    return new Promise(
      (resolve, reject) => {
        if (validator.isEmpty(username) ||
          validator.isEmpty(login) ||
          validator.isEmpty(password) ||
          validator.isEmpty(passwordTwo)) {
          addAlert(registerText.empty, 'danger');
        } else if (!validator.isLength(username, {min: 5, max: undefined})) {
          addAlert(registerText.username.length, 'danger');
        } else if (!validator.isLength(login, {min: 5, max: undefined})) {
          addAlert(registerText.login.length, 'danger');
        } else if (!validator.isLength(password, {min: 5, max: undefined})) {
          addAlert(registerText.password.length, 'danger');
        } else if (!validator.isAscii(username)) {
          addAlert(registerText.username.ascii, 'danger');
        } else if (!validator.isAlphanumeric(login)) {
          addAlert(registerText.login.ascii, 'danger');
        } else if (!validator.isAlphanumeric(password)) {
          addAlert(registerText.password.ascii, 'danger');
        } else {
          !validator.equals(password, passwordTwo) ?
          addAlert(registerText.matchPassword, 'danger') :
          resolve(true);
        }
        reject(false);
      }
    );
  }
}
export default new FoodgramValidator();
