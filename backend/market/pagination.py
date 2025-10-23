from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response


class PageSizeOffsetPagination(LimitOffsetPagination):
    limit_query_param = "limit"
    offset_query_param = "offset"

    default_limit = 25
    max_limit = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "page_size": self.get_limit(self.request),
                "offset": self.get_offset(self.request),
                "results": data,
            }
        )
