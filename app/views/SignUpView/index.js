import React from 'react';
import PropTypes from 'prop-types';


import {withTheme} from "../../theme";
import TextInput from '../../containers/TextInput';
import KeyboardView from "../../containers/KeyboardView";
import {themes} from "../../constants/colors";
import sharedStyles from "../Styles";
import StatusBar from "../../containers/StatusBar";
import styles from "./styles";
import {Alert, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import Button from "../../containers/Button";
import {withActionSheet} from "../../containers/ActionSheet";
import ImagePicker from "react-native-image-crop-picker";
import images from "../../assets/images";
import scrollPersistTaps from "../../utils/scrollPersistTaps";
import SafeAreaView from "../../containers/SafeAreaView";
import {isValidEmail} from "../../utils/validators";
import {showErrorAlert, showToast} from "../../lib/info";
import firebaseSdk from "../../lib/firebaseSdk";
import AsyncStorage from "@react-native-community/async-storage";
import {CURRENT_USER} from "../../constants/keys";
import {checkCameraPermission, checkPhotosPermission} from "../../utils/permissions";
import CheckBox from "../../containers/CheckBox";

const imagePickerConfig = {
    cropping: true,
    compressImageQuality: 0.8,
    enableRotationGesture: true,
    avoidEmptySpaceAroundImage: false,
    cropperChooseText: 'Choose',
    cropperCancelText: 'Cancel',
    mediaType: 'photo',
    includeBase64: true
};

class SingUpView extends React.Component{
    static navigationOptions = ({ navigation }) => ({
        title: 'Sign Up'
    })

    static propTypes = {
        navigation: PropTypes.object,
        theme: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            image_path: null,
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirm: '',
            isLoading: false,
            allowTerms: false
        }
    }

    takePhoto = async () => {
        if(await checkCameraPermission()) {
            ImagePicker.openCamera(imagePickerConfig).then(image => {
                this.setState({image_path: image.path});
            });
        }
    }

    chooseFromLibrary = async () => {
        if(await checkPhotosPermission()) {
            ImagePicker.openPicker(imagePickerConfig).then(image => {
                this.setState({image_path: image.path});
            });
        }
    }

    toggleAction = () => {
        Alert.alert(
            '',
            'Upload Photo',
            [
                {
                    text: "CANCEL", onPress: () => {
                    }
                },
                {
                    text: "TAKE A PHOTO", onPress: () => {
                        this.takePhoto();
                    }
                },
                {
                    text: "FROM GALLERY", onPress: () => {
                        this.chooseFromLibrary();
                    }
                },
            ]);
    }

    onGoToSignIn = () => {
        const {navigation} = this.props;
        navigation.pop();
    }

    isValid = () => {
        const {first_name, last_name, email, password, password_confirm} = this.state;

        if(!first_name.length){
            showToast('Please enter your first name.');
            this.firstNameInput.focus();
            return false;
        }
        if(!last_name.length){
            showToast('Please enter your last name.');
            this.lastInput.focus();
            return false;
        }
        if(!email.length){
            showToast('Please enter your email.');
            this.emailInput.focus();
            return false;
        }
        if(!isValidEmail(email)){
            showToast('Email address is invalid.');
            this.emailInput.focus();
            return false;
        }
        if(!password.length){
            showToast('Please enter your password.');
            this.passwordInput.focus();
            return false;
        }
        if(password.length < 6){
            showToast('Password should be at least 6 characters.');
            this.passwordInput.focus();
            return false;
        }
        if(!password_confirm.length){
            showToast('Please enter your confirm password.');
            this.passwordConfirmInput.focus();
            return false;
        }
        if(password_confirm !== password){
            showToast('Passwords do not match. Please check and try again.');
            return false;
        }
        return true;
    }
    onGotoTerms = () => {
        const {navigation} = this.props;
        navigation.navigate('About', {type: 2});
    }

    onGotoPrivacy = () => {
        const {navigation} = this.props;
        navigation.navigate('About', {type: 1});
    }

    onSubmit = () => {
        if(this.isValid()){
            const {image_path} = this.state;
            this.setState({isLoading: true});

            if(image_path){
                firebaseSdk.uploadMedia(firebaseSdk.STORAGE_TYPE_AVATAR, image_path).then(image_url => {
                    this.registerUser(image_url);
                }).catch((err) => {
                    showErrorAlert(err, 'Error');
                    this.setState({isLoading: false});
                })
            } else {
                this.registerUser();
            }
        }
    }

    registerUser = (image_url = null) => {
        const {navigation} = this.props;
        const {first_name, last_name, email, password} = this.state;

        const user = {
            firstName: first_name,
            lastName: last_name,
            email: email,
            password: password,
            avatar: image_url,
        }

        firebaseSdk.signUp(user)
            .then(async (user) => {
                this.setState({isLoading: false});
                showToast('You have successfully registered.');
                navigation.pop();
            })
            .catch((err) => {
                showErrorAlert(err, 'Error');
                this.setState({isLoading: false});
            })
    }

    render(){
        const {theme} = this.props;
        const {image_path, isLoading, allowTerms} = this.state;
        return (
            <KeyboardView
                style={{backgroundColor: themes[theme].backgroundColor}}
                contentContainerStyle={sharedStyles.container}
                keyboardVerticalOffset={128}
            >
                <StatusBar/>
                <ScrollView contentContainerStyle={{flexGrow: 1}} {...scrollPersistTaps}>
                    <SafeAreaView>
                        <View style={[sharedStyles.headerContainer, {height: 160, backgroundColor: themes[theme].headerBackground}]}>
                            <TouchableOpacity onPress={this.toggleAction}>
                                <Image style={styles.logo} source={image_path?{uri: image_path}:images.img_upload}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formContainer}>
                            <TextInput
                                inputRef={(e) => {
                                    this.firstNameInput = e;
                                }}
                                placeholder={'First Name'}
                                returnKeyType='next'
                                keyboardType='twitter'
                                textContentType='oneTimeCode'
                                onChangeText={value => this.setState({first_name: value})}
                                onSubmitEditing={() => {
                                    this.lastInput.focus();
                                }}
                                theme={theme}
                            />
                            <TextInput
                                inputRef={(e) => {
                                    this.lastInput = e;
                                }}
                                placeholder={'Last Name'}
                                returnKeyType='next'
                                keyboardType='twitter'
                                textContentType='oneTimeCode'
                                onChangeText={value => this.setState({last_name: value})}
                                onSubmitEditing={() => {
                                    this.emailInput.focus();
                                }}
                                theme={theme}
                            />
                            <TextInput
                                inputRef={(e) => {
                                    this.emailInput = e;
                                }}
                                placeholder={'Email'}
                                returnKeyType='next'
                                keyboardType='email-address'
                                textContentType='oneTimeCode'
                                onChangeText={email => this.setState({email})}
                                onSubmitEditing={() => {
                                    this.passwordInput.focus();
                                }}
                                theme={theme}
                            />
                            <TextInput
                                inputRef={(e) => {
                                    this.passwordInput = e;
                                }}
                                placeholder={'Password'}
                                returnKeyType='next'
                                secureTextEntry
                                textContentType='oneTimeCode'
                                onChangeText={value => this.setState({password: value})}
                                onSubmitEditing={() => { this.passwordConfirmInput.focus(); }}
                                theme={theme}
                            />
                            <TextInput
                                inputRef={(e) => {
                                    this.passwordConfirmInput = e;
                                }}
                                placeholder={'Confirm Password'}
                                returnKeyType='send'
                                secureTextEntry
                                textContentType='oneTimeCode'
                                onChangeText={value => this.setState({password_confirm: value})}
                                theme={theme}
                            />
                            <View style={styles.terms}>
                                <View style={styles.termItem}>
                                    <CheckBox
                                        checked={allowTerms}
                                        onPress={() => this.setState({allowTerms: !allowTerms})}
                                        containerStyle={{backgroundColor: 'transparent', borderWidth: 0, marginRight: 10}}
                                    />
                                    <Text style={{color: themes[theme].actionTintColor}}>I agree with the </Text>
                                    <Text style={{...sharedStyles.link, color: themes[theme].actionTintColor}}
                                          onPress={this.onGotoTerms}> Terms and Conditions </Text>
                                    <Text style={{color: themes[theme].actionTintColor}}> and </Text>
                                </View>
                                <View style={{marginLeft: 30}}>
                                    <Text style={{...sharedStyles.link, color: themes[theme].actionTintColor}}
                                          onPress={this.onGotoPrivacy}> Privacy Policy </Text>
                                </View>
                            </View>
                            <Button
                                style={styles.submitBtn}
                                title={'Create Account'}
                                type='primary'
                                size='W'
                                disabled={!allowTerms}
                                onPress={this.onSubmit}
                                testID='login-view-submit'
                                loading={isLoading}
                                theme={theme}
                            />
                            <View style={styles.bottomContainer}>
                                <Text style={{color: themes[theme].actionTintColor}}>Already have an account? </Text>
                                <Text style={{...sharedStyles.link, color: themes[theme].actionTintColor}}
                                      onPress={this.onGoToSignIn}> Sign In</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardView>
        );
    }
}

export default withTheme(SingUpView);
