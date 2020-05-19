import React, { Component } from 'react';
import { Text, View, YellowBox, Dimensions, Image, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Picker, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import { StackActions } from '@react-navigation/native';
import * as firebase from 'firebase';
import Uid from 'uid';

YellowBox.ignoreWarnings(['Setting a timer']);
const { width, height } = Dimensions.get('window');

export default class Home extends Component {
  state = {
    user: {},
    loading: true,
    tweets: [],
    modalVisible: false,
    userModal: false,
    tweet: '',
    selectedValue: '',
    tweet_picture: '',
    commentModalVisible: false,
    comments: [],
    commentText: '',
    openCommentUid: ''
  }

  componentDidMount = async () => {
    firebase.auth().onAuthStateChanged(auth => {
      if (auth) {
        firebase.database().ref('users').child(auth.uid).once('value', (snap) => {
          this.setState({ user: snap.val() })
        })
        firebase.database().ref('tweets').on('value', (snapshot) => {
          let chats = [];
          snapshot.forEach((snap) => {
            chats.push(snap.val());
          });
          this.setState({ tweets: chats.reverse() })
        })
      }
    });
  }

  sendTweet = () => {
    if (!(this.state.tweet === '')) {
      let key = Uid();
      let time = new Date().getTime()
      firebase.database().ref('tweets').child(time).set({
        tweet: this.state.tweet,
        tweet_picture: this.state.tweet_picture,
        timestamp: time,
        like: 0,
        date: {
          day: new Date().getDate(),
          mounth: (new Date().getMonth()) + 1,
          year: new Date().getFullYear()
        },
        time: {
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
          second: new Date().getSeconds()

        },
        user: {
          uid: this.state.user.uid,
          photo: this.state.user.photo,
          name: this.state.user.name,
          verify: this.state.user.verify
        },
        like_user: [this.state.user.uid],
        comment: [
          {
            name: this.state.user.name,
            text: this.state.tweet,
            verify: this.state.user.verify,
            photo: this.state.user.photo,
          }
        ]
      }).then(() => {
        firebase.database().ref('users').child(this.state.user.uid).child('user_tweets').push(key)
        this.setState({ modalVisible: false, tweet: '', tweet_picture: '' });
      }).catch((err) => {
        Alert.alert('Oops', 'Tweet Atılamadı', [
          { text: 'Tamam' }
        ])
      })
    }
  }

  logout = () => {
    firebase.auth().signOut()
      .then(() => {
        this.props.navigation.dispatch(
          StackActions.replace('Login')
        );
      })
      .catch((error) => {
        Alert.alert('Oops', 'Çıkış Yapılamadı', [
          { text: 'Tamam' }
        ])
      });
  }

  deleteTweet = (uid) => {
    firebase.database().ref('tweets').child(uid).remove()
    this.setState({ selectedValue: '' })
  }

  deletePicture = (uid) => {
    firebase.database().ref('tweets').child(uid).child('tweet_picture').set('')
    this.setState({ selectedValue: '' })
  }

  writeTime = (date, time) => {
    if (date.year == new Date().getFullYear()) {
      if (date.mounth == new Date().getMonth() + 1) {
        if (date.day == new Date().getDate()) {
          if (time.hour == new Date().getHours()) {
            return `${new Date().getMinutes() - time.minute} dakika önce`
          }
          else {
            return `${new Date().getHours() - time.hour} saat önce`
          }
        }
        else if (7 > (new Date().getDate() - date.day)) {
          return `${new Date().getDate() - date.day} gün önce`
        }
        else if (7 == (new Date().getDate() - date.day)) {
          return '1 hafta önce'
        }
        else {
          return `${date.day} ${this.mounthReturn(date.mounth)}`
        }
      }
      else {
        return `${date.day} ${this.mounthReturn(date.mounth)}`
      }
    }
    else {
      return `${date.day} ${this.mounthReturn(date.mounth)} ${date.year}`
    }
  }

  mounthReturn = (mounth) => {
    switch (mounth) {
      case 1:
        return 'Ocak'
        break;
      case 2:
        return 'Şubat'
        break;
      case 3:
        return 'Mart'
        break;
      case 4:
        return 'Nisan'
        break;
      case 5:
        return 'Mayıs'
        break;
      case 6:
        return 'Haziran'
        break;
      case 7:
        return 'Temmuz'
        break;
      case 8:
        return 'Ağustos'
        break;
      case 3:
        return 'Eylül'
        break;
      case 4:
        return 'Ekim'
        break;
      case 5:
        return 'Kasım'
        break;
      case 6:
        return 'Aralık'
        break;
      default:
        return 'NaN'
        break;
    }
  }

  like = (uid, user) => {
    if (!(this.state.user.uid == user)) {
      firebase.database().ref('tweets').child(uid).child('like_user').once('value', (snapshot) => {
        let list = snapshot.val();
        let num = 0;
        snapshot.forEach(snap => {
          if (snap.val() == this.state.user.uid) {
            firebase.database().ref('tweets').child(uid).child('like_user').child(num).remove()
            firebase.database().ref('tweets').child(uid).child('like').once('value', (snap) => {
              firebase.database().ref('tweets').child(uid).child('like').set(snap.val() - 2)
            })
          }
          else {
            num++;
            firebase.database().ref('tweets').child(uid).child('like_user').child(num).set(this.state.user.uid)
            firebase.database().ref('tweets').child(uid).child('like').once('value', (snap) => {
              firebase.database().ref('tweets').child(uid).child('like').set(snap.val() + 1)
            })
          }
        })
      })
    }
  }

  like_icon = (users) => {
    let rtn = <Icon name='heart-o' size={18} type='font-awesome' color='#e84118' />
    users.forEach((uid) => {
      if (uid == this.state.user.uid) {
        rtn = <Icon name='heart' size={18} type='font-awesome' color='#e84118' />
      }
      else {
        rtn = <Icon name='heart-o' size={18} type='font-awesome' color='#e84118' />
      }
    })
    return rtn
  }

  openUserModal = () => {
    this.setState({
      userModal: true
    });
  }

  closeUserModal = () => {
    this.setState({
      userModal: false
    });
  }

  commentModal = (uid, comment) => {
    this.setState({ commentModalVisible: true, comments: comment, openCommentUid: uid })
  }

  sendComment = () => {
    let num = this.state.comments.length;

    firebase.database().ref('tweets').child(this.state.openCommentUid).child('comment').child(num).set({
      name: this.state.user.name,
      text: this.state.commentText,
      verify: this.state.user.verify,
      photo: this.state.user.photo,
    })
    let comment = this.state.comments;
    comment.push({
      name: this.state.user.name,
      text: this.state.commentText,
      verify: this.state.user.verify,
      photo: this.state.user.photo,
    })
    this.setState({ comments: comment })
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ width: width, height: 20 }} />
        <View style={{ width: width, alignItems: "center", padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => this.openUserModal()}><Image
            style={{ width: 40, height: 40, borderRadius: 20 }}
            source={{ uri: this.state.user.photo }}
          /></TouchableOpacity>
          <Icon name='twitter' size={32} type='material-community' color='#00acee' />
          <View style={{ width: 40, height: 40, borderRadius: 20 }} />
        </View>

        <ScrollView>
          <View style={{ alignItems: 'center' }}>

            {this.state.tweets.map(tweets => {
              return (
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7 }}>
                  <View style={{ flexDirection: "row", alignItems: 'center', marginVertical: 6, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        style={{ width: 35, height: 35, borderRadius: 20, marginLeft: 10 }}
                        source={{ uri: tweets.user.photo }}
                      />
                      <Text style={{ marginLeft: 8, marginRight: 5, fontSize: 16, fontWeight: '700' }}>{tweets.user.name}</Text>
                      {tweets.user.verify == 'var' ?
                        <Icon name='verified' size={15} type='octicon' color='#00acee' />
                        : null
                      }
                    </View>
                    <Picker
                      selectedValue={this.state.selectedValue}
                      style={{ height: 50, width: 40 }}
                      onValueChange={(itemValue, itemIndex) => { if (itemValue == 'sil') { this.deleteTweet(tweets.timestamp) } else if (itemValue == 'fsil') { this.deletePicture(tweets.timestamp) } }}
                    >
                      {this.state.selectedValue == 'sil' ? this.deleteTweet(tweets.timestamp) : null}
                      <Picker.Item label="Bildir" value="bildir" />
                      {this.state.user.uid == tweets.user.uid ? <Picker.Item label="Fotoğrafı Sil" value="fsil" /> : null}
                      {this.state.user.uid == tweets.user.uid ? <Picker.Item label="Tweet'i Sil" value="sil" /> : null}
                    </Picker>
                  </View>
                  <View style={{ marginHorizontal: 11, marginBottom: 5 }}>
                    <Text style={{ color: '#2c3e50' }}>{tweets.tweet}</Text>
                  </View>
                  {tweets.tweet_picture == '' ? null :
                    <View style={{ marginHorizontal: 11, marginBottom: 5 }}>
                      <Image
                        style={{ width: '100%', height: 140, borderRadius: 6 }}
                        source={{ uri: tweets.tweet_picture }}
                      />
                    </View>
                  }
                  <View style={{ marginHorizontal: 11, marginBottom: 7, justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => this.like(tweets.timestamp, tweets.user.uid)}>
                        {
                          this.like_icon(tweets.like_user)
                        }
                      </TouchableOpacity>
                      <Text style={{ marginHorizontal: 3, color: '#95a5a6' }}>{tweets.like}</Text>
                      <TouchableOpacity onPress={() => this.commentModal(tweets.timestamp, tweets.comment)}>
                        <Icon iconStyle={{ paddingLeft: 5 }} name='comment-o' size={18} type='font-awesome' color='gray' />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ color: '#95a5a6', textAlign: 'right' }}>{this.writeTime(tweets.date, tweets.time)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>

        <TouchableOpacity style={{ position: 'absolute', right: 15, bottom: 15 }} onPress={() => this.setState({ modalVisible: true })}>
          <View style={{ width: 60, height: 60, borderRadius: 35, backgroundColor: '#00aced', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='feather-alt' size={32} type='font-awesome-5' color='white' />
          </View>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}>
          <View style={{ height: height, width: width, backgroundColor: 'white' }}>
            <View style={{ width: width, alignItems: "center", padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => this.setState({ modalVisible: false })}>
                <Text style={{ color: '#00aced', fontSize: 18 }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.sendTweet()}>
                <View style={{ padding: 10, borderRadius: 25, backgroundColor: '#00aced' }}>
                  <Text style={{ color: 'white', fontSize: 16 }}>Tweet at</Text>
                </View>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder='Durumunuz veya atmak istediğiniz tweet'
              style={{ width: width - 20, padding: 10, fontSize: 16 }}
              underlineColorAndroid='transparent'
              onChangeText={tweet => this.setState({ tweet: tweet })}
              value={this.state.tweet}
              keyboardType='default'
              placeholderTextColor='gray'
              multiline={true}
            />

            <TextInput
              placeholder='Tweet fotoğrafı (isteğe bağlı)'
              style={{ width: width - 20, padding: 10, fontSize: 16, marginTop: 30 }}
              underlineColorAndroid='transparent'
              onChangeText={tweetp => this.setState({ tweet_picture: tweetp })}
              value={this.state.tweet_picture}
              keyboardType='default'
              placeholderTextColor='gray'
            />
          </View>
        </Modal>


        <Modal
          animationType='slide'
          transparent={true}
          visible={this.state.userModal}>
          <View style={{ height: height, width: width, backgroundColor: 'white', paddingHorizontal: 10 }}>
            <View style={{ width: width, alignItems: "center", flexDirection: 'row', justifyContent: 'flex-start' }}>
              <TouchableOpacity onPress={() => this.closeUserModal()}>
                <Icon name='arrow-back' color='#00aced' size={32} />
              </TouchableOpacity>
            </View>
            <View style={{ marginVertical: 13, flexDirection: 'row' }}>
              <Image
                style={{ width: 80, height: 80, borderRadius: 90 }}
                source={{ uri: this.state.user.photo }}
              />
              <View style={{ paddingHorizontal: 10, maxWidth: '80%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 23 }}>{this.state.user.name}</Text>
                  {this.state.user.verify == 'var' ?
                    <Icon name='verified' size={20} type='octicon' iconStyle={{ paddingLeft: 7 }} color='#00acee' />
                    : null
                  }
                </View>
                <Text style={{ fontSize: 14, opacity: 0.5 }}>{this.state.user.bio}</Text>
              </View>
            </View>
            <ScrollView>
              <TouchableOpacity onPress={() => console.log('basıldı')}>
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginVertical: 12, marginHorizontal: 12, alignItems: 'center' }}>
                    <Icon name='user' size={34} type='font-awesome' color='gray' />
                    <Text style={{ color: 'gray', fontSize: 20, fontWeight: '700', paddingLeft: 10 }}>Kullanıcı Adını Değiştir</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('basıldı')}>
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginVertical: 12, marginHorizontal: 12, alignItems: 'center' }}>
                    <Icon name='address-card' size={34} type='font-awesome' color='gray' />
                    <Text style={{ color: 'gray', fontSize: 20, fontWeight: '700', paddingLeft: 10 }}>Bio'nu Düzenle</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('basıldı')}>
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginVertical: 12, marginHorizontal: 12, alignItems: 'center' }}>
                    <Icon name='lock' size={34} type='font-awesome-5' color='gray' />
                    <Text style={{ color: 'gray', fontSize: 20, fontWeight: '700', paddingLeft: 10 }}>Şifreni değiştri</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('basıldı')}>
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginVertical: 12, marginHorizontal: 12, alignItems: 'center' }}>
                    <Icon name='info-circle' size={34} type='font-awesome-5' color='gray' />
                    <Text style={{ color: 'gray', fontSize: 20, fontWeight: '700', paddingLeft: 10 }}>Hakkında</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.logout()}>
                <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', marginVertical: 12, marginHorizontal: 12, alignItems: 'center' }}>
                    <Icon name='sign-out-alt' size={34} type='font-awesome-5' color='#e74c3c' />
                    <Text style={{ color: '#e74c3c', fontSize: 20, fontWeight: '700', paddingLeft: 10 }}>Çıkış Yap</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        <Modal
          animationType='fade'
          transparent={true}
          visible={this.state.commentModalVisible}>
          <View style={{ height: height, width: width, backgroundColor: 'white' }}>
            <View style={{ width: width, alignItems: "center", flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 10 }}>
              <TouchableOpacity onPress={() => this.setState({ commentModalVisible: false, openCommentUid: '' })}>
                <Icon name='arrow-back' color='#00aced' size={32} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS == "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >

              <ScrollView>
                <View style={{ alignItems: 'center' }}>
                  {this.state.comments.map(comment => {
                    return (
                      <View style={{ width: width - 20, height: 'auto', backgroundColor: '#f7f7f7', borderRadius: 6, marginVertical: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: 'center', marginVertical: 6 }}>
                          <View style={{ flexDirection: 'row' }}>
                            <Image
                              style={{ width: 50, height: 50, borderRadius: 50, marginLeft: 10, marginTop: 3 }}
                              source={{ uri: comment.photo }}
                            />
                            <View style={{ marginLeft: 10 }}>
                              <View style={{ flexDirection: 'row' }}><Text style={{ marginRight: 5, fontSize: 16, fontWeight: '700' }}>{comment.name}</Text>
                                {comment.verify == 'var' ?
                                  <Icon name='verified' size={15} type='octicon' color='#00acee' />
                                  : null
                                }
                              </View>
                              <View style={{ marginBottom: 5, marginRight:10, width:width-100 }}>
                                <Text style={{ color: '#2c3e50' }}>{comment.text}</Text>
                                </View>
                            </View>
                          </View>

                        </View>
                        
                      </View>
                      
                    )
                  })
                  }
                </View>
              </ScrollView>


              <View style={{ width: width, position: 'absolute', bottom: 24, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, flexDirection: 'row', borderColor: 'lightgray' }}>
                <TextInput
                  placeholder='Atmak istediğiniz yorum'
                  style={{ width: width - 50, padding: 4, fontSize: 16 }}
                  underlineColorAndroid='transparent'
                  onChangeText={tweet => this.setState({ commentText: tweet })}
                  value={this.state.commentText}
                  keyboardType='default'
                  placeholderTextColor='gray'
                />
                <TouchableOpacity onPress={() => this.sendComment()}>
                  <Icon name='send' size={33} type='font-awesome' color='#00acee' />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>





          </View>
        </Modal>
      </View>
    )
  }
}
