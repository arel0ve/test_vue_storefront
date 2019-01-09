<template>
  <div>
    <div class="search-input-group" v-if="isDesktop" @click="inputSearch">
      <label for="search-input">
        <i class="material-icons search-icon">search</i>
      </label>
      <input
        ref="searchInput"
        id="search-input"
        :v-model="searchQuery"
        class="search-input"
        :placeholder="$t('Type what you are looking for...')"
        type="text"
        @keydown.prevent="inputSearch"
      >
    </div>
    <div v-else>
      <button
        type="button"
        :aria-label="$t('Open search panel')"
        class="bg-cl-transparent brdr-none inline-flex"
        @click="toggleSearchpanel"
        data-testid="openSearchPanel"
      >
        <i class="material-icons">search</i>
      </button>
    </div>
  </div>
</template>

<script>
import SearchIcon from '@vue-storefront/core/compatibility/components/blocks/Header/SearchIcon'

export default {
  data () {
    return {
      isDesktop: false,
      searchQuery: ''
    }
  },
  mixins: [SearchIcon],
  created () {
    if (!!window.navigator.platform && !navigator.userAgent.match(/iPhone|iPad|iPod|Android|Mobile/i)) {
      this.isDesktop = true
    }
    if (this.$store.state.searchQuery) {
      this.searchQuery = this.$store.state.searchQuery
    }
    this.$bus.$on('clean-search', () => {
      this.searchQuery = ''
    })
  },
  methods: {
    inputSearch () {
      this.$store.state.searchQuery = this.searchQuery
      this.showSearchpanel()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input-group {
  display: flex;
}

.search-icon {
  cursor: pointer;
}
.search-input {
  min-width: 20vw;
  @media (min-width: 1200px) {
    min-width: 15vw;
  }
}
</style>
