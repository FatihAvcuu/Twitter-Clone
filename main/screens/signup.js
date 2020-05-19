import React, { Component } from 'react';
import { Text, View, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { StackActions } from '@react-navigation/native';
import * as firebase from 'firebase';

const { width, height } = Dimensions.get('window');

export default class Login extends Component {
    state = {
        email: '',
        name: '',
        password: '',
        image:'',
        loading: false
    }

    signUpApp = () => {
        this.setState({ loading: true });
        firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then((auth) => {
            let uid = auth.user.uid;
            this.createUser(uid)
        })
        .catch((err) => {
            this.setState({ loading: false });
            Alert.alert('Oops', 'Kayıt olunamadı', [
                { text: 'Tamam' }
            ])
        })
    }

    createUser = (uid) => {
        if(this.state.image == '') {
        firebase.database().ref('users').child(uid).set({
            email:this.state.email,
            uid:uid,
            name: (this.state.name).toLocaleLowerCase(),
            password:this.state.password,
            photo:'https://pbs.twimg.com/profile_images/857089270414233601/H5OtJMkD_400x400.jpg',
            bio:"Henüz bir bio bulunmamaktadır",
            verify:'yok'
        })}
        else{
            firebase.database().ref('users').child(uid).set({
                email:this.state.email,
                uid:uid,
                name: (this.state.name).toLocaleLowerCase(),
                password:this.state.password,
                photo:this.state.image
            })
        }
    }

    goLogin = () => {
        const popAction = StackActions.pop(1);

        this.props.navigation.dispatch(popAction);
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
                        <TouchableOpacity onPress={() => this.goLogin()}>
                            <Icon name='arrow-back' color='#00aced' size={32} />
                        </TouchableOpacity>
                        <Icon name='twitter' size={32} type='material-community' color='#00acee' />
                        <Icon name='arrow-back' color='transparent' size={32} />
                    </View>
                    <View style={{ width: width, paddingLeft: 15, marginTop: 7 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hesabını oluştur</Text>

                        <TextInput
                            placeholder='Adınız'
                            style={{ width: width - 30, paddingVertical: 20, borderBottomWidth: 1, borderColor: 'lightgray', color: '#00acee' }}
                            underlineColorAndroid='transparent'
                            onChangeText={name => this.setState({ name: name })}
                            value={this.state.name}
                            keyboardType='default'
                            placeholderTextColor='gray'
                        />

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

                        <TextInput
                            placeholder='Profil fotoğrafı adresi (isteğe bağlı)'
                            style={{ width: width - 30, paddingVertical: 20, borderBottomWidth: 1, borderColor: 'lightgray', color: '#00acee' }}
                            underlineColorAndroid='transparent'
                            onChangeText={img => this.setState({ image: img })}
                            value={this.state.image}
                            keyboardType='default'
                            placeholderTextColor='gray'
                        />
                    </View>
                    <View style={{ flex: 1 }} />
                    <View style={{ width: width, height: 50, borderTopWidth: 1, borderColor: '#eeeeee', alignItems: 'flex-end', justifyContent: 'center', paddingRight: 10 }}>
                        <TouchableOpacity onPress={() => this.signUpApp()}>
                            <View style={{ height: 35, width: 65, backgroundColor: '#00acee', justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>İleri</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }
}
