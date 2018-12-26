<template>
  <button
    :class="{'active': active}"
    class="bg-cl-primary brdr-1 brdr-cl-primary brdr-square h5 cl-tertiary new-selector"
    @click="switchFilter(id, label)"
    :aria-label="$t('Select ' + label)"
  >
    {{ label }}
  </button>
</template>

<script>
import { ProductCustomOption } from '@vue-storefront/core/modules/catalog/components/ProductCustomOption'

export default {
  name: 'NewSelector',
  mixins: [ProductCustomOption]
}
</script>

<style lang="scss" scoped>
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
$color-active: color(secondary);
$color-disabled: color(secondary, $colors-border);

.new-selector {
  margin-bottom: 10px;
  padding: 8px;
  display: block;
  &:hover {
    font-weight: 600;
    border-width: 2px;
  }
  &.active {
    border-color: $color-active;
    border-width: 2px;
    color: $color-active;
  }
}
</style>
