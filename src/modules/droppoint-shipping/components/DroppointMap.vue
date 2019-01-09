<template>
  <div class="droppoint-map">
    <h4 class="col-xs-12">
      {{ $t('Choose your city') }}
    </h4>
    <base-select
      class="col-xs-12 col-sm-6 mb25"
      name="cities"
      :options="citiesOptions"
      :selected="city"
      :placeholder="$t('City *')"
      :validations="[
        {
          condition: $v.shipping.city.$error && !$v.shipping.city.required,
          text: $t('Field is required')
        }
      ]"
      v-model="city"
      @input="changeCity"
    />

    {{ error }}

    <h4 class="col-xs-12">
      {{ $t('Choose shop') }}
    </h4>
    <gmap-map class="map-container" :center="center" :zoom="12" :options="{streetViewControl:false, fullscreenControl: false}">
      <gmap-marker
        v-for="(m, index) in droppoints"
        :key="index"
        :position="m.position"
        :animation="selected === m.id ? 1 : 0"
        :clickable="true"
        :icon="m.icon"
        @click="selectDroppoint(m)" />
    </gmap-map>

    <span :key="index" v-for="(field, index) in extraFields">
      {{ field.title }}
      <input type="text" v-model="shipping.extraFields[index]" @keyup="$v.shipping.extraFields[index].$touch(); setShipping()">

      <span
        class="validation-error"
        v-if="$v.shipping.extraFields[index].$error && !$v.shipping.extraFields[index].required"
      >
        {{ $t('Field is required') }}
      </span>

    </span>

    <span :key="index" v-for="(m, index) in droppoints" @click="selectDroppoint(m)" >
      <label class="radioStyled">
        <p>{{ m.name.toUpperCase() }}</p>
        <p>{{ m.streetname }}, {{ m.streetname2 }}</p>
        <p>{{ m.zipcode }} {{ m.city }}</p>
        <input type="radio" v-model="selected" :value="m.id" >
        <span class="checkmark"/>
      </label>
    </span>
  </div>
</template>

<script>
import Vue from 'vue'
import { required, minLength } from 'vuelidate/lib/validators'

import { dps } from './droppoints'
import BaseSelect from '@vue-storefront/theme-default/components/core/blocks/Form/BaseSelect'
import BaseInput from '@vue-storefront/theme-default/components/core/blocks/Form/BaseInput'

// GoogleMaps cannot be included while in SSR
if (process.browser) {
  const VueGoogleMaps = require('vue2-google-maps')
  Vue.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyBQwWyTufRQqwJajpxqcCPfdgH27qKWNzc',
      libraries: 'places'
    }
  })
}

export default {
  name: 'DroppointMap',
  components: {BaseInput, BaseSelect},
  data () {
    return {
      center: {lat: 55.488351, lng: 9.479296},
      droppoints: [],
      error: '',
      extraFields: {},
      loading: false,
      city: null,
      cities: [],
      selected: {id: null},
      shipping: this.$store.state.checkout.shippingDetails
    }
  },
  computed: {
    citiesOptions () {
      return this.cities.map(item => {
        return {
          value: item,
          label: item
        }
      })
    }
  },
  props: {
    shippingMethod: {
      type: String,
      required: true
    },
    zipcode: {
      type: Number,
      default: null,
      required: false
    }
  },
  validations () {
    let val = {
      shipping: {
        phoneNumber: {
          required,
          minLength: minLength(8)
        },
        city: {
          required
        }
      }
    }
    if (this.extraFields) {
      val.shipping.extraFields = {}
      for (const [key, value] of Object.entries(this.extraFields)) {
        val.shipping.extraFields[key] = {}
        if (value.required) {
          val.shipping.extraFields[key] = {required}
        }
      }
    }
    return val
  },
  created () {
    dps.forEach(dp => {
      if (!this.cities.includes(dp.city)) {
        this.cities.push(dp.city)
      }
    })
    this.city = this.cities[0]
    this.setDroppoints(dps.filter(dp => dp.city === this.city))
  },
  methods: {
    changeCity (city = this.city) {
      this.setDroppoints(dps.filter(dp => dp.city === this.city))
    },
    selectDroppoint (m) {
      let phoneNumber = this.shipping.phoneNumber
      this.selected = m.id

      let nameArr = m.name.split(' ')
      let first = nameArr[0]
      let last = nameArr[1]

      if (!last || last.length === 0) {
        last = first
      }

      this.shipping = {
        firstName: first,
        lastName: last,
        streetAddress: m.streetname,
        apartmentNumber: m.streetname2,
        zipCode: m.zipcode,
        company: m.id,
        city: m.city,
        droppoint: m,
        country: m.country,
        phoneNumber: phoneNumber,
        shippingMethod: this.shippingMethod
      }

      this.$v.$touch()
      this.setShipping()
    },
    setShipping (invalidate = false) {
      if (!this.$v.$invalid && !invalidate) {
        this.$bus.$emit('checkout-after-shippingset', this.shipping)
      }
    },
    setDroppoints (droppoints = []) {
      this.droppoints = droppoints
      this.center = droppoints[0].position
    },
    getDroppoints () {
      this.droppoints = []
      if (this.searchZipcode) {
        this.loading = true
        this.error = null
        if (this.$config.droppointShipping) {
          let endpoint = this.$config.droppointShipping[this.shippingMethod].endpoint

          this.$store.dispatch('droppoint-shipping/fetch', {
            url: endpoint + '/zipcode/' + encodeURIComponent(this.searchZipcode),
            payload: {
              method: 'GET',
              headers: {'Content-Type': 'application/json'},
              mode: 'cors'
            },
            callback_event: 'droppoint-map-update'
          }, {root: true})
        }
      }
    }
  },
  watch: {
    shippingMethod (val, oldVal) {
      if (val !== oldVal) {
        this.getDroppoints()
        this.selected = {}
        this.setShipping(true)
      }
    }
  },
  mounted () {
    if (this.shipping) {
      if (this.shipping.zipCode) {
        this.searchZipcode = this.shipping.zipCode
        this.getDroppoints()
      }

      if (
        (typeof this.shipping.droppoint === 'object') &&
        (this.shipping.droppoint.id !== null)
      ) {
        this.selectDroppoint(this.shipping.droppoint)
      } else {
        this.shipping.streetAddress = ''
      }
    }
    this.$bus.$on('droppoint-map-update', (event) => {
      this.loading = false
      if (event.result.droppoints) {
        this.setDroppoints(event.result.droppoints)

        if (event.result.center) {
          this.center = event.result.center.position
        }

        this.extraFields = event.result.extraFields
        this.shipping.extraFields = {}
      } else {
        this.error = event.result.error
      }
      this.setShipping()
    })
  },
  destroyed () {
    this.$bus.$off('droppoint-map-update')
  }
}
</script>

<style>
  .map-container {
    width: 100%;
    height: 400px;
  }
</style>
