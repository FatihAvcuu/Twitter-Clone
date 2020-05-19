import React, { Component } from 'react';
import { Text, View, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { StackActions } from '@react-navigation/native';
import * as firebase from 'firebase';

const { width, height } = Dimensions.get('window');

export default class Login extends Component {
    state = {
        email: '',
        password: '',
        loading: true
    }

    componentDidMount = () => {
        firebase.auth().onAuthStateChanged(auth => {
            if (auth) {
                //yönlendirme
                this.props.navigation.dispatch(
                    StackActions.replace('Home')
                );
            }
            else {
                this.setState({ loading: false });
            }
        });
    }

    loginApp = () => {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                //giriş başarılı
            })
            .catch((err) => {
                this.setState({ loading: false });
                Alert.alert('Oops', 'Giriş Yapılamadı', [
                    { text: 'Tamam' }
                ])
            })
    }

    goSignUp = () => {
        const pushAction = StackActions.push('SignUp');

        this.props.navigation.dispatch(pushAction);
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size='small' color='black' />
                </View>
            )
        }
        else {
            return (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ width: width, height: 20 }} />
                    <View style={{ width: width, padding: 10, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={{ textAlign: 'right', color: 'transparent', fontWeight: 'bold', fontSize: 16 }}>Kaydol</Text>
                        <Icon name='twitter' size={32} type='material-community' color='#00acee' />
                        <TouchableOpacity onPress={() => this.goSignUp()}>
                            <Text style={{ textAlign: 'right', color: '#00acee', fontWeight: 'bold', fontSize: 16 }}>Kaydol</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: width, paddingLeft: 15, marginTop: 7 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Twitter'a giriş yap.</Text>

                        <TextInput
                            placeholder='E-posta'
                            style={{ width: width - 30, paddingVertical: 20, borderBottomWidth: 1, borderColor: 'lightgray', color: '#00acee' }}
                            underlineColorAndroid='transparent'
                            onChangeText={email => this.setState({ email: email })}
                            value={this.state.email}
                            keyboardType='email-address'
                            placeholderTextColor='gray'
                        />

                        <TextInput
                            placeholder='Şifre'
                            style={{ width: width - 30, paddingVertical: 20, borderBottomWidth: 1, borderColor: 'lightgray', color: '#00acee' }}
                            underlineColorAndroid='transparent'
                            onChangeText={password => this.setState({ password: password })}
                            value={this.state.password}
                            secureTextEntry
                            placeholderTextColor='gray'
                        />

                        <Text style={{ textAlign: 'center', color: 'gray', paddingTop: 20 }}>Şifreni mi unuttun?</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={{ width: width, height: 50, borderTopWidth: 1, borderColor: '#eeeeee', alignItems: 'flex-end', justifyContent: 'center', paddingRight: 10 }}>
                        <TouchableOpacity onPress={() => this.loginApp()}>
                            <View style={{ height: 35, width: 100, backgroundColor: '#00acee', justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Giriş yap</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }
}
