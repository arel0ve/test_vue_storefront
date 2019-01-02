import { mapState } from 'vuex'
import { Search } from '@vue-storefront/core/modules/catalog/components/Search'

export default {
  name: 'SearchIcon',
  computed: {
    ...mapState({
      isOpen: state => state.ui.searchpanel
    })
  },
  methods: {
    toggleSearchpanel () {
      this.$bus.$emit('focusSearchInput')
      this.$store.commit('ui/setSearchpanel', !this.isOpen)
    },
    showSearchpanel () {
      this.$bus.$emit('focusSearchInput')
      this.$store.commit('ui/setSearchpanel', true)
    }
  }
}
